const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { GoogleGenAI } = require('@google/genai');
const Generation = require('../models/Generation');
const Hairstyle = require('../models/Hairstyle');
const User = require('../models/User');
const {protect} = require('../middleware/auth');
const { trackEvent } = require('../utils/analytics');
const { low_cut,standard_prompt, analysis_prompt } = require('../prompts/all_prompts');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { generationLimit } = require('../middleware/rateLimit');

const router = express.Router();

const ai = new GoogleGenAI({
    apiKey:  process.env.GEMINI_API_KEY,
  });


 function getMimeTypeFromBase64(base64String) {
  const match = base64String.match(/^data:(.*?);base64,/);
  if (!match || match.length < 2) {
    return null;
  }
  return match[1];
}


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});



const HAIRSTYLE_ANALYSIS_PROMPT = analysis_prompt()




// New helper function for Gemini Hairstyle Analysis (similar to your existing one)
async function analyzeHairstyleWithGemini(imageBuffer, mimeType) {
  try {
    const model = 'gemini-2.5-flash';
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    const response = await ai.models.generateContent({
        model: model,
         contents: [{ text: HAIRSTYLE_ANALYSIS_PROMPT }, imagePart], 
        generationConfig: {
          responseMimeType: 'application/text',
        },
    });


    return  response.candidates[0].content.parts[0].text

  } catch (error) {
    console.error('Gemini Hairstyle Analysis Error:', error);
    throw new Error('AI analysis service failed.');
  }
}


// --- 🌟 UPDATED ROUTE: Analyze & Generate Custom Hairstyle ---
// @desc    Analyze uploaded hairstyle image, create record, and start generation
// @route   POST /api/generations/analyze-hairstyle (Renamed to match user's reported URL)
// @access  Protected

const analyzeHairstyleUpload = upload.fields([
    { name: 'hairstyleImage', maxCount: 1 }, // Matches formData.append('hairstyleImage', ...)
    { name: 'userPhoto', maxCount: 1 },      // Matches formData.append('userPhoto', ...)
]);

router.post('/analyze-hairstyle', protect, analyzeHairstyleUpload, async (req, res) => {
    const CUSTOM_STYLE_PRICE = 3;
    
    try {
       const files = req.files;

        if (!files || !files.hairstyleImage || !files.userPhoto) {
            return res.status(400).json({ success: false, message: 'Both hairstyle image and user photo are required.' });
        }

const hairstyleFile = files.hairstyleImage[0]; 
        const userPhotoFile = files.userPhoto[0];
        
        const user = req.user;

        const hairstyleImageBuffer = hairstyleFile.buffer;
        const hairstyleMimeType = hairstyleFile.mimetype;
        
        const userPhotoBuffer = userPhotoFile.buffer;
        const userPhotoMimeType = userPhotoFile.mimetype;



        // 1. Check Credits (Charge for the full generation now)
        if (user.credits < CUSTOM_STYLE_PRICE) {
          return res.status(400).json({ success: false, message: 'Insufficient credits. Requires 3 credits.' });
        }

        // 2. Perform AI analysis
        const ai_description = await analyzeHairstyleWithGemini(hairstyleImageBuffer, hairstyleMimeType);
        
        // 3. Upload the original Hairstyle image to Cloudinary (for thumbnail/reference)
        // NOTE: uploadToCloudinary must support taking a Buffer as input
        const originalImageUpload = await uploadToCloudinary(hairstyleImageBuffer, 'custom_hairstyles');

        // 4. Create the new Hairstyle record
        const newHairstyle = new Hairstyle({
            name: 'Custom Hairstyle from Analysis',
            category: 'Modern', 
            gender: 'unisex', 
            thumbnail: originalImageUpload.secure_url, 
            ai_description: ai_description,
            price: CUSTOM_STYLE_PRICE,
            isActive: false, 
            isCustom: true, 
            userId: req.user._id, 

        });
        await newHairstyle.save();

        // 5. Upload the user's original photo to Cloudinary (avoid storing base64 blobs in MongoDB)
        const originalUserPhotoUpload = await uploadToCloudinary(userPhotoBuffer, 'original_images');

        const generation = new Generation({
            user: user._id,
            hairstyle: newHairstyle._id, 
          'originalImage.url': originalUserPhotoUpload.secure_url,
          'originalImage.publicId': originalUserPhotoUpload.public_id,
            creditsUsed: CUSTOM_STYLE_PRICE,
            status: 'processing',
            metadata: {
                userAgent: req.get('User-Agent'),
                ipAddress: req.ip,
                deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop',
                customHairstyleSource: 'analysis' 
            }
        });
        await generation.save();

        // 6. Deduct Credits & Respond to Client
        await user.useCredits(CUSTOM_STYLE_PRICE);
   

        res.json({
            success: true,
            data: {
                generationId: generation._id,
                status: 'processing',
                ai_description: ai_description
            }
        });

        // 7. Process generation asynchronously 
        (async () => {
            const creditsCharged = CUSTOM_STYLE_PRICE;
            try {
                const originalImageForGeneration = userPhotoBuffer;
                const originalMimeTypeForGeneration = userPhotoMimeType;

                const result = await generateHairstyleWithGemini(
                    originalImageForGeneration, 
                    newHairstyle, 
                    originalMimeTypeForGeneration
                ); 
                
                if (result.success) {
                    const generatedImageUrl = `data:${result.mimeType};base64,${result.imageData}`;
                    // Upload the GENERATED image to Cloudinary
                    const generatedImageUpload = await uploadToCloudinary(generatedImageUrl, 'generated_images');

                    // Update the generation record with the Cloudinary URL
                    generation.status = 'completed';
                    generation.generatedImage = {
                        url: generatedImageUpload.secure_url,
                        publicId: generatedImageUpload.public_id,
                    };
                    await generation.save();

                    // Increment generation count on the Hairstyle (as it was successful)
                    await newHairstyle.incrementGeneration();
                    
                    

                } else {
                    generation.status = 'failed';
                    generation.errorMessage = String(result.error.message || 'AI generation failed').slice(0, 255);
                    // CRITICAL: Refund credits on failure
                    await user.addCredits(creditsCharged);
                    await generation.save();

                   
                }
            } catch (error) {
                console.error('Async generation processing error:', error);
                generation.status = 'failed';
                generation.errorMessage = 'Processing failed: ' + error.message;
                await user.addCredits(creditsCharged); 
                await generation.save();
            }
        })();

    } catch (error) {
        console.error('Analyze and Generate failed:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to start custom generation.' });
    }
});


 async function generateHairstyleWithGemini(imageBuffer, hairstyle,mimeType) {
  try {
    const base64Image = imageBuffer.toString('base64');
    let prompt_text = null;

    switch (hairstyle.category) {
    case 'Default':
        prompt_text = low_cut(hairstyle.ai_description);
        break;  
    default:
        prompt_text = standard_prompt(hairstyle.ai_description);
        break;  
  }


    const prompt = [
      { 
        text: prompt_text
      },
      {
        inlineData: {
          mimeType: mimeType, 
          data: base64Image,
        },
      },
    ];

 const response = await ai.models.generateContent({
   model: "gemini-2.5-flash-image" , //gemini-2.5-flash-image
      contents: prompt,
    });

    // Extract the generated image from response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        return {
          success: true,
          imageData: part.inlineData.data,
          mimeType: part.inlineData.mimeType
        };
      }
    }


    throw new Error('No image generated in response');
  } catch (error) {
    console.error('Gemini AI generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}


// Generate hairstyle (Standard Hairstyle Generation)
// Rate limited to prevent AI abuse
router.post('/generate', protect, generationLimit, upload.single('image'), [
  body('hairstyleId').isMongoId().withMessage('Valid hairstyle ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { hairstyleId,mimeType } = req.body;
    const user = req.user;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const hairstyle = await Hairstyle.findById(hairstyleId);

    if (!hairstyle) {
      return res.status(404).json({ success: false, message: 'Hairstyle not found' });
    }

    if (user.credits < hairstyle.price) {
      return res.status(400).json({ success: false, message: 'Insufficient credits' });
    }
    
    // Pre-increment and save (Deducting credit is done right before async call)
    hairstyle.generationCount = hairstyle.generationCount+1
    await hairstyle.save() 

      // Upload the user's original photo to Cloudinary (avoid storing base64 blobs in MongoDB)
      const originalUserPhotoUpload = await uploadToCloudinary(req.file.buffer, 'original_images');


    // 1. Create the generation record 
    const generation = new Generation({
      user: user._id,
      hairstyle: hairstyle._id,
      'originalImage.url': originalUserPhotoUpload.secure_url,
      'originalImage.publicId': originalUserPhotoUpload.public_id,
      creditsUsed: hairstyle.price,
      status: 'processing',
       metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
      }
    });
    await generation.save();

    // 2. Deduct credits
    await user.useCredits(hairstyle.price);
    
     await trackEvent('generation_started', {
      userId: user._id,
      generationId: generation._id,
      hairstyleId,
      creditsUsed: hairstyle.price
    }, req);

    res.json({
      success: true,
      data: {
        generationId: generation._id,
        status: 'processing',
      }
    });

    // 3. Process generation asynchronously
    (async () => {
      const creditsCharged = hairstyle.price;
      try {
        const result = await generateHairstyleWithGemini(req.file.buffer, hairstyle,mimeType);
        
        if (result.success) {
          const generatedImageUrl = `data:${result.mimeType};base64,${result.imageData}`;
          
          // 4. Upload the GENERATED image to Cloudinary
          const generatedImageUpload = await uploadToCloudinary(generatedImageUrl, 'generated_images');

          // 5. Update the record with the Cloudinary URL
          generation.status = 'completed';
          generation.generatedImage = {
            url: generatedImageUpload.secure_url,
            publicId: generatedImageUpload.public_id,
          };
          await generation.save();

          // Hairstyle count already incremented and saved
           await trackEvent('generation_completed', {
            userId: user._id,
            generationId: generation._id,
            hairstyleId,
            processingTime: 0
          });

        } else {
          generation.status = 'failed';
          generation.errorMessage = String(result.error.message || 'AI generation failed').slice(0, 255);
          // CRITICAL: Refund credits on failure
          await user.addCredits(creditsCharged); 
          await generation.save();
               await trackEvent('generation_failed', {
            userId: user._id,
            generationId: generation._id,
            hairstyleId,
            error: result.error
          });
        }
      } catch (error) {
        console.error('Async generation processing error:', error);
        generation.status = 'failed';
        generation.errorMessage = 'Processing failed: ' + error.message;
        // CRITICAL: Refund credits on processing error
        await user.addCredits(creditsCharged); 
        await generation.save();
      }
    })();

  } catch (error) {
    console.error('Generate hairstyle error:', error);
    res.status(500).json({ success: false, message: 'Failed to start generation' });
  }
});



// Get generation status (No change needed here)
router.get('/:id/status', protect, async (req, res) => {
  try {
    console.log(req.params.id,req.user._id )
    const generation = await Generation.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('hairstyle', 'name');

    if (!generation) {
      return res.status(404).json({
        success: false,
        message: 'Generation not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: generation._id,
        status: generation.status,
        generatedImageUrl: generation.generatedImage.url,
        processingTime: generation.processingTime,
        errorMessage: generation.errorMessage,
        hairstyle: generation.hairstyleId,
        createdAt: generation.createdAt
      }
    });

  } catch (error) {
    console.error('Get generation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get generation status'
    });
  }
});



// Get user generations history
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const generations = await Generation.find({ user: req.user._id })
      .populate('hairstyle', 'name thumbnail category')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Generation.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: generations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get generations history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get generations history'
    });
  }
});

module.exports = router;