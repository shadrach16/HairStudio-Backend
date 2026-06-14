/**
 * Batch 22 Seed Script - 10 fresh verified hairstyle records
 * Live DB before latest run: 359 total | Target after: 369
 *
 * Images are Pexels-sourced, visually reviewed for clear hairstyle visibility,
 * and selected to avoid previously seeded local image IDs.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Hairstyle = require('../models/Hairstyle');

// ---------- Cloudinary ----------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(imageUrl, publicId) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: `Hairstyles/${publicId}`,
      folder: '',
      transformation: [
        { width: 600, height: 800, crop: 'fill', gravity: 'face', quality: 'auto' },
      ],
      overwrite: true,
    });
    console.log(`  Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    console.error(`  Upload failed for ${publicId}:`, err.message);
    throw err;
  }
}

// ---------- Hairstyle Data ----------
const newHairstyles = [
  // 1 - Coils/male
  {
    name: 'Sunlit High-Volume Curl Top with Tapered Sides',
    category: 'Coils',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/13517000/pexels-photo-13517000.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 63,
    ai_description: `### Title: Sunlit High-Volume Curl Top with Tapered Sides

### Overview
A clean urban portrait showing a young man with a high-volume curly top and visibly shorter sides. The curls rise upward in a rounded cloud shape, with tighter definition through the front and crown. Warm outdoor light separates the coils clearly from the orange wall behind him, making the texture and silhouette easy to read. The look feels youthful, natural, and expressive without looking over-styled.

### Styling Details
- Dense 3C/4A curls lifted high through the top and crown
- Shorter tapered sides around the temples and ears
- Natural dark brown base with warm highlights from sunlight
- Free-form curl placement with no hard parting
- Rounded top silhouette with visible spring and movement
- Minimal product finish, likely curl cream or leave-in moisturizer
- Clean neckline and side area without a sharp lineup

### Ideal For
Oval, square, and heart face shapes. The height adds drama while the shorter sides keep the profile neat. Best maintained with curl hydration, light picking at the roots, and periodic taper cleanup to preserve the contrast between the sides and the high curl top.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '3C/4A',
      length: 'medium',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 2 - Coils/male
  {
    name: 'Defined Chocolate Ringlet Crop with Soft Fringe',
    category: 'Coils',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/10505645/pexels-photo-10505645.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 61,
    ai_description: `### Title: Defined Chocolate Ringlet Crop with Soft Fringe

### Overview
A close portrait of a short-to-medium curly crop with very clear ringlet definition. The hair sits forward over the forehead in soft curls while the sides stay compact and natural. The image shows the curl pattern sharply, with individual spirals visible across the front and crown. It is a polished wash-and-go style that keeps natural movement while still looking shaped and intentional.

### Styling Details
- Short-to-medium 3B/3C ringlets concentrated on top
- Soft curly fringe falling naturally toward the forehead
- Compact sides with no hard fade line
- Natural chocolate brown color with healthy shine
- Curls defined in separated spirals rather than brushed-out volume
- No visible parting, hard part, or artificial color
- Lightweight curl cream or gel finish for definition

### Ideal For
Oval, diamond, and oblong face shapes. The forward curl fringe softens the forehead and frames the eyes, while the compact sides keep the style balanced. Maintenance is best with a gentle curl routine, leave-in conditioner, and occasional trims to keep the fringe controlled.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3B/3C',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 3 - Afros/male
  {
    name: 'Golden-Hour Curly Halo with Natural Beard',
    category: 'Afros',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/18796594/pexels-photo-18796594.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 62,
    ai_description: `### Title: Golden-Hour Curly Halo with Natural Beard

### Overview
A warm outdoor portrait featuring a full curly halo that expands around the head with visible height and width. The hair has a soft, rounded afro-inspired silhouette, with loose-to-tight curls catching the sunset light. A natural beard balances the volume on top and gives the look a relaxed, grown-in finish. The hairstyle is clear, dimensional, and strongly centered in the frame.

### Styling Details
- Medium-length curly halo with rounded afro volume
- Dense 3C curl pattern with airy separation at the edges
- Natural dark brown color warmed by golden-hour lighting
- No parting; curls fall in a free-form shape around the head
- Full top and side volume with a slightly softer perimeter
- Natural beard pairing for a cohesive textured look
- Light curl product or leave-in conditioner, not a rigid set

### Ideal For
Oval, long, and angular face shapes. The rounded width balances longer faces and adds softness to sharper features. Keep the shape with regular moisturizing, gentle detangling, and light trimming around the perimeter when the halo begins to lose balance.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3C',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 4 - Bob/male
  {
    name: 'Monochrome Curly Shag with Face-Framing Fringe',
    category: 'Bob',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/16943618/pexels-photo-16943618.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 58,
    ai_description: `### Title: Monochrome Curly Shag with Face-Framing Fringe

### Overview
A black-and-white portrait of a medium curly shag that frames the face with soft, uneven fringe. The hair has enough length to fall around the forehead, temples, and ears, giving it a relaxed bob-like outline without becoming long. The monochrome treatment emphasizes the silhouette and curl texture, making the shape readable and clean. It is an understated, editorial take on a male curly bob.

### Styling Details
- Medium curly length around the forehead, sides, and ears
- Soft fringe falling naturally across the brow line
- Loose 3A/3B curls with natural separation and flyaway texture
- No hard part, fade, or sharp barber line
- Rounded shag outline with face-framing side curls
- Natural dark hair shown in monochrome photography
- Air-dried or lightly diffused finish for movement

### Ideal For
Oval, heart, and angular face shapes. The fringe and side curls soften the face while the medium length gives styling versatility. Maintenance requires curl hydration, light shaping trims, and occasional diffusing or air drying to preserve the relaxed shag outline.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3A/3B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 5 - Braids/male
  {
    name: 'Beaded Box Braids with Clean Nape Rows',
    category: 'Braids',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/16778662/pexels-photo-16778662.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 60,
    ai_description: `### Title: Beaded Box Braids with Clean Nape Rows

### Overview
A rear portrait that clearly showcases short individual box braids finished with transparent beads. The view from behind makes the parting pattern, scalp rows, and braid placement easy to inspect. The nape is closely tapered beneath the braids, creating a clean contrast between the protective braid section and the shorter back area. The beads add movement and a distinctive streetwear detail.

### Styling Details
- Short individual box braids hanging to the nape
- Transparent beads secured near the braid ends
- Clean geometric scalp partings visible from the back
- Closely tapered nape below the braid section
- Natural black braid base with neat, even sections
- Low-volume protective finish that keeps hair off the face
- Fresh braid tension with minimal frizz at the roots

### Ideal For
Oval, square, and round face shapes. This style gives the structure of box braids while keeping the length compact and practical. It is best maintained by wrapping at night, oiling the scalp lightly, and refreshing beads or ends when they loosen.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'box-braid',
      volumeProfile: 'low',
      partingPattern: 'geometric',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 6 - Braids/male
  {
    name: 'Blush-Pink Rope Braids with Studio Glow',
    category: 'Braids',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/31719680/pexels-photo-31719680.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 67,
    ai_description: `### Title: Blush-Pink Rope Braids with Studio Glow

### Overview
A fashion portrait featuring long blush-pink braids styled to fall around the face and shoulders. The braided texture is highly visible, with pale pink and platinum tones catching the red studio light behind the subject. The style reads as intentional, expressive, and editorial while still being a wearable protective look. The image clearly shows the braid thickness, length, color, and face-framing placement.

### Styling Details
- Long rope-like braids falling past the shoulders
- Blush-pink and pale platinum color treatment throughout
- Face-framing braid placement with a soft center opening
- Medium braid thickness with consistent structure
- Studio lighting adds warm red highlights without hiding the texture
- Natural root area blended into the colored braids
- Smooth protective finish with controlled frizz

### Ideal For
Oval, heart, and diamond face shapes. The long colored braids frame the face and create a bold fashion statement without requiring daily heat styling. Best maintained with scalp care, satin wrapping, and gentle braid refreshes around the hairline as needed.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'box-braid',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'blush-pink',
      hasColorTreatment: true,
      colorNotes: 'Blush-pink and pale platinum braid color with warm red studio reflections.',
      promptFamily: 'braids-twists',
    },
  },

  // 7 - Twists/male
  {
    name: 'Tailored Short Rope Twists with Soft Side Fall',
    category: 'Twists',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/10485385/pexels-photo-10485385.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 59,
    ai_description: `### Title: Tailored Short Rope Twists with Soft Side Fall

### Overview
A polished portrait of short rope twists worn with a tailored suit. The twists are compact and uniform, falling lightly across the forehead and sides without obscuring the hairstyle. Close framing makes the root spacing and twist direction clear, while the formal clothing shows how the style can work in refined settings. The overall look is neat, youthful, and professional.

### Styling Details
- Short rope twists falling to the forehead and upper cheeks
- Clean root sections with visible scalp spacing
- Natural black color with no dye or extensions visible
- Low-to-medium volume that sits close to the head
- Twists hang freely with a soft side-forward fall
- Neat perimeter without a hard fade or shaved design
- Fresh protective style with controlled frizz

### Ideal For
Oval, square, and long face shapes. The short twists soften the face while keeping the silhouette compact enough for professional settings. Maintenance involves scalp hydration, night wrapping, and retwisting loose sections every few weeks.`,
    attributes: {
      hairType: 'twisted',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'other',
      volumeProfile: 'low',
      partingPattern: 'geometric',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 8 - Afros/male
  {
    name: 'Oversized Freeform Afro with Knit Vest',
    category: 'Afros',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/13315065/pexels-photo-13315065.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 66,
    ai_description: `### Title: Oversized Freeform Afro with Knit Vest

### Overview
A strong fashion portrait centered on a very full freeform afro with dramatic width and height. The hair expands outward in a large rounded shape, with dense natural texture visible along the perimeter. Directional lighting gives the afro clear edges against the background, while the warm knit vest adds a styled editorial feel. This is a confident, high-volume natural look with excellent hairstyle visibility.

### Styling Details
- Oversized natural afro with very high volume
- Dense 4B/4C texture expanded into a wide rounded silhouette
- Natural black color with subtle light reflection at the edges
- Freeform shape with no parting or visible manipulation pattern
- Hair picked or stretched for maximum width and height
- Soft, natural perimeter rather than a sharply barbered outline
- Minimal styling beyond hydration, picking, and shaping

### Ideal For
Oval, diamond, and narrow face shapes. The volume adds balance and creates a powerful visual identity. Best maintained with regular moisturizing, gentle detangling, careful night protection, and shape trims to keep the silhouette intentional instead of uneven.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B/4C',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'very-high',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 9 - Locs/male
  {
    name: 'Short Freeform Locs with Studio Green Shirt',
    category: 'Locs',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/32147060/pexels-photo-32147060.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 57,
    ai_description: `### Title: Short Freeform Locs with Studio Green Shirt

### Overview
A studio portrait showing short freeform locs falling forward over the forehead. The locs are compact, separated, and textured, with enough length to create movement without covering the face fully. The dark background and green shirt keep attention on the hair silhouette, while sunglasses add a styled fashion edge. The hairstyle reads clearly as a short loc look with natural density and direction.

### Styling Details
- Short freeform locs concentrated around the crown and forehead
- Natural black color with textured, separated loc ends
- Locs fall forward in a loose fringe shape
- Low-to-medium volume with compact density
- No visible hard part or geometric sectioning
- Clean overall grooming with a soft facial-hair pairing
- Styled naturally, likely maintained with palm rolling or freeform care

### Ideal For
Oval, square, and heart face shapes. Short locs offer texture and movement while staying manageable for daily wear. Maintenance can be freeform or lightly palm-rolled depending on the desired neatness, with regular scalp cleansing and moisturizing.`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'free-form',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // 10 - Modern/male
  {
    name: 'Slick Push-Back Side Profile with Clean Taper',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/7909278/pexels-photo-7909278.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 56,
    ai_description: `### Title: Slick Push-Back Side Profile with Clean Taper

### Overview
A dramatic side-profile portrait of a slick push-back hairstyle with a clean tapered side. The hair is combed straight back from the forehead, creating a smooth controlled surface with subtle shine. The black-and-white lighting emphasizes the neat side transition and the direction of the combing. It is a refined modern style that feels sharp, minimal, and professional.

### Styling Details
- Medium-length top combed directly backward
- Clean tapered side around the temple and ear
- Smooth, controlled finish with light shine
- Natural dark hair shown in monochrome photography
- No hard part; the style relies on backward direction and product control
- Low-to-medium volume, close to the scalp rather than lifted high
- Likely styled with pomade, cream, or gel for hold

### Ideal For
Oval, square, and round face shapes. The backward sweep elongates the profile and exposes facial structure, while the taper keeps the silhouette clean. Maintain with regular taper trims and a small amount of styling product applied after combing damp hair backward.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C/2A',
      length: 'medium',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },
];

// ---------- Seed Runner ----------
async function seed() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGO_URI found in environment');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB\n');

  let created = 0;
  let skipped = 0;

  for (const style of newHairstyles) {
    console.log(`Processing: ${style.name} (${style.category}/${style.gender})`);

    const exists = await Hairstyle.findOne({ name: style.name });
    if (exists) {
      console.log('  Already exists - skipping');
      skipped++;
      continue;
    }

    const slug = style.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/_+$/, '');

    const thumbnail = await uploadToCloudinary(style.sourceUrl, slug);

    await Hairstyle.create({
      name: style.name,
      category: style.category,
      gender: style.gender,
      thumbnail,
      ai_description: style.ai_description,
      attributes: style.attributes,
      attributesVersion: 1,
      price: style.price,
      popularity: style.popularity,
      isActive: true,
      generationCount: 0,
      averageRating: 0,
      isCustom: false,
    });

    console.log(`  Created: ${style.name}`);
    created++;
  }

  console.log(`\nDone - Created: ${created} | Skipped: ${skipped}`);
  const total = await Hairstyle.countDocuments();
  console.log(`Total hairstyles in DB: ${total}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});