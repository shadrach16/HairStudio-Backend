/**
 * Batch 17 Seed Script — 10 new NON-AFRICAN hairstyles
 * DB before: ~249 total | Target after: ~259
 *
 * Category targets (filling under-represented):
 *   Bob/male (critical-1)  |  Modern/male  |  Straight/male
 *   Straight/female        |  Fashion/female
 *   Relaxed/female         |  Fades/female |  Bob/female
 *   Low Cut/male           |  Modern/female
 *
 * Sources: All Pexels (free license)
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
    console.log(`  ✅ Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    console.error(`  ❌ Upload failed for ${publicId}:`, err.message);
    throw err;
  }
}

// ---------- Hairstyle Data ----------
const newHairstyles = [

  // 1 — Bob/male (only 1 in DB — critical)
  {
    name: 'Dramatic Long Flow with Beard and Dark Studio Lighting',
    category: 'Bob',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/6274754/pexels-photo-6274754.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 58,
    ai_description: `### Title: Dramatic Long Flow with Beard and Dark Studio Lighting

### Overview
A commanding studio portrait of a bearded man with long, flowing dark hair that extends past the shoulders. The hair is thick, naturally straight to slightly wavy, and falls with gravity-defying volume. Shot in dramatic dark studio lighting, the hair catches moody highlights that reveal rich dark-brown to near-black tones. The full beard is well-groomed and complements the long hairstyle perfectly, creating a rugged yet intentional aesthetic. The hair is parted loosely off-center with strands falling freely across the shoulders. This is a bold, unconventional men's hairstyle that communicates confidence and artistic sensibility.

### Styling Details
- Long hair extending past the shoulders, approximately 12-14 inches
- Dark brown to near-black color with natural highlights from lighting
- Naturally straight with subtle wave at the ends
- Loose off-center part, allowing hair to fall naturally
- Thick, full volume from roots to ends
- Well-maintained full beard complementing the long hair
- No visible layers — one-length flow with natural tapering at ends
- Minimal product — relies on natural texture and weight
- Clean, healthy hair with subtle sheen
- Dark studio backdrop emphasizes the hair's volume and movement

### Ideal For
Oval, oblong, and diamond face shapes. The combination of long flowing hair with a full beard creates excellent proportional balance. Perfect for men who are committed to growing out their hair and maintaining it with proper care. A statement look that works in creative and artistic professions.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'side-left',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 2 — Bob/male
  {
    name: 'Medium-Length Man Bob with Neutral Studio Pose',
    category: 'Bob',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/8090285/pexels-photo-8090285.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 55,
    ai_description: `### Title: Medium-Length Man Bob with Neutral Studio Pose

### Overview
A clean studio portrait of a man sporting a medium-length bob hairstyle that falls just past the jawline to the shoulders. The hair is dark, thick, and naturally straight with a healthy, well-maintained appearance. Styled with a subtle center part, the hair falls evenly on both sides of the face, framing it symmetrically. The look is effortlessly cool — minimal styling with maximum impact. Against a solid black background, the hair's texture and volume are beautifully highlighted. This is the modern man bob — not too long, not too short, perfectly balanced and gender-fluid in its appeal.

### Styling Details
- Shoulder-length dark hair with natural straight texture
- Subtle center part creating a symmetrical frame
- Hair falls just past the jawline to the collarbone
- One-length cut with minimal layering
- Thick, healthy hair with natural volume at the roots
- No styling product visible — clean, natural finish
- Dark brown to black color with no color treatment
- Neutral expression with studio lighting highlighting hair texture
- Clean edges at the bottom with natural tapering
- Low-maintenance styling — wash, condition, air-dry

### Ideal For
Square, oval, and heart face shapes. The medium length softens angular jawlines while the center part balances wider foreheads. An increasingly popular men's style that bridges traditional and modern aesthetics. Minimal daily maintenance — simply brush and go.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 3 — Modern/male
  {
    name: 'Tousled Light-Brown Textured Crop',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/8736106/pexels-photo-8736106.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 68,
    ai_description: `### Title: Tousled Light-Brown Textured Crop

### Overview
A detailed close-up showcasing a man's stylish tousled crop haircut with light-brown coloring. The hair is cut to approximately 2-3 inches on top with natural movement and texture that creates an effortlessly messy, lived-in look. The color is a warm light brown with natural sun-kissed highlights throughout — the kind of multi-tonal warmth that looks like summer. The texture is the star — each strand has been worked with a matte texturizing product to create separation, definition, and that coveted bedhead effect. This is modern men's grooming at its finest: structured chaos that looks completely natural.

### Styling Details
- Short to medium crop, approximately 2-3 inches on top
- Light brown base color with natural caramel and honey highlights
- Tousled, textured finish with deliberate piece-y separation
- Forward-directed styling with strands falling toward the forehead
- Matte finish from texturizing clay or paste
- Visible layers creating movement and dimension
- Natural volume at the crown with slightly flatter sides
- No defined part — hair moves freely in multiple directions
- Clean, tapered sides blending into the longer top
- Subtle undercut graduation visible at the temples

### Ideal For
All face shapes, particularly round and square. The textured height on top elongates the face while the tousled style adds width where needed. Perfect for men who want a low-effort, high-impact daily style. Apply a small amount of texturizing product to towel-dried hair, work through with fingers, and go.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'short',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'light-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 4 — Straight/male
  {
    name: 'Wavy Dark Hair with Beige Studio Backdrop',
    category: 'Straight',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/10204127/pexels-photo-10204127.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 62,
    ai_description: `### Title: Wavy Dark Hair with Beige Studio Backdrop

### Overview
A striking close-up portrait of a young man with dark wavy hair against a warm beige background. The hair is thick, naturally wavy, and styled with an effortless side sweep that reveals the forehead while keeping volume on top. The color is a deep, rich black-brown that catches studio lighting with a healthy, natural sheen. The wave pattern is loose and gentle — type 2A waves that create soft S-curves rather than defined curls. The hair length is approximately 4-5 inches on top, slightly shorter at the sides, creating a classic proportional balance. This is the quintessential "good hair day" for men with naturally wavy dark hair.

### Styling Details
- Medium length on top (4-5 inches) with shorter, tapered sides
- Deep black-brown color with natural highlights from studio lighting
- Type 2A loose wave pattern with gentle S-curves
- Side-swept styling off the forehead, right to left
- Natural volume at the crown creating height
- Healthy, hydrated appearance with subtle natural sheen
- No hard product — styled with light cream or natural oils
- Sideburns neatly trimmed and blended
- Clean around the ears with natural taper
- Overall well-groomed but not over-styled

### Ideal For
Oval, round, and heart face shapes. The side sweep and top volume create length, making this particularly flattering for rounder faces. An everyday versatile style that works for both casual and professional settings. Simply work a light styling cream through damp hair, finger-comb to one side, and let air dry.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'side-right',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 5 — Modern/male
  {
    name: 'Moody Wavy Locks with Thoughtful Expression',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/5749346/pexels-photo-5749346.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 63,
    ai_description: `### Title: Moody Wavy Locks with Thoughtful Expression

### Overview
An atmospheric portrait of a man with thick, dark wavy hair styled in a modern, slightly disheveled fashion. The hair is medium-length with waves that create natural body and movement. Shot in moody, low-key lighting, the dark hair blends artfully with the shadowy environment, with selective highlights revealing the wave pattern and texture. The styling is deliberately undone — hair pushed back from the forehead with some strands falling forward, creating an artistic, bohemian vibe. A beard complements the longer hairstyle, reinforcing the rugged, creative aesthetic.

### Styling Details
- Medium length, approximately 5-6 inches on top and sides
- Deep dark brown, nearly black color
- Type 2B wavy pattern with defined S-waves
- Pushed-back styling from the forehead with natural fall-forward
- Full volume throughout — thick, dense hair
- Beard adds dimension to the overall grooming aesthetic
- No visible part — hair swept back loosely
- Matte finish with no visible product shine
- Layered cut allowing waves to form naturally
- Ear-length on the sides with longer crown
- Atmospheric studio setting enhancing the hair's dark tones

### Ideal For
Oblong, oval, and square face shapes. The full waves and pushed-back style add width and drama. Perfect for men who embrace a longer, more artistic hairstyle and have naturally wavy or curly hair. Works beautifully with facial hair. Style by applying a light hold mousse to damp hair and pushing back with fingers while air drying.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 6 — Bob/female
  {
    name: 'Polished Profile Bob in Striped Shirt',
    category: 'Bob',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/8954692/pexels-photo-8954692.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 67,
    ai_description: `### Title: Polished Profile Bob in Striped Shirt

### Overview
A beautiful side-profile portrait of a woman showcasing a perfectly executed chin-length bob haircut. The hair is light to medium brown with subtle warm highlights and is cut in a classic blunt bob that ends precisely at the jawline. The cut is impeccably even — each strand seems to know its place, creating a smooth, uniform hemline. From the profile angle, the bob's geometry is on full display: clean lines, precise angles, and a slight inward curl at the ends that adds sophistication. The hair has a healthy, natural shine with smooth texture throughout. A simple striped shirt keeps the focus entirely on the flawless bob cut.

### Styling Details
- Classic chin-length blunt bob ending at the jawline
- Light to medium brown color with subtle warm highlights
- Straight to slightly wavy texture with inward curl at the ends
- Side-swept or natural part (not visible from profile angle)
- Smooth, polished finish with healthy natural shine
- Even, precise hemline with no layering visible
- Hair sits close to the head with controlled volume
- Subtle inward curl at the ends from blow-dry styling
- Clean nape line with hair tucked behind the ear on one side
- Minimal product — light serum for shine and smoothness

### Ideal For
All face shapes, particularly heart and oval. The chin-length bob creates a classic frame that accentuates the jawline and neck. One of the most timeless and universally flattering hairstyles for women. Blow-dry with a round brush, curling ends inward for the polished finish.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'flat-iron',
      volumeProfile: 'low',
      partingPattern: 'side-left',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'light-brown',
      hasColorTreatment: true,
      colorNotes: 'Subtle warm highlights blended into a light brown base',
      promptFamily: 'standard',
    },
  },

  // 7 — Straight/female
  {
    name: 'Classic White Turtleneck Bob with Natural Makeup',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/5301009/pexels-photo-5301009.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 65,
    ai_description: `### Title: Classic White Turtleneck Bob with Natural Makeup

### Overview
A stunning close-up portrait of a young woman with a perfectly styled chin-length bob and natural makeup against a clean studio backdrop. The hair is dark brown to black with a sleek, straight texture that falls precisely at chin level. The cut features soft, face-framing layers around the front that blend seamlessly into the blunt back. A natural center-to-slightly-off-center part creates a balanced, symmetrical frame around the face. The white turtleneck provides a crisp, clean contrast that makes the dark bob stand out sharply. The hair has a healthy, natural finish — not overly sleek or flat-ironed, but smooth and well-maintained.

### Styling Details
- Chin-length bob with subtle face-framing layers in front
- Dark brown to black color with no visible color treatment
- Straight texture with natural movement — not pin-straight
- Center-to-slightly-off-center part for balanced framing
- Soft volume at the crown, tapering to a clean hemline
- Natural, healthy finish without excessive shine or matte products
- Clean edges with slight natural texture at the ends
- Hair tucks naturally behind the ears showing pearl earrings
- Minimal layering — mostly one-length with slight graduation at front
- Fresh, youthful styling that complements natural makeup

### Ideal For
All face shapes, especially oval and round. The chin-length and face-framing layers create an incredibly versatile and flattering frame. A go-to everyday hairstyle that transitions seamlessly from casual to professional settings. Blow-dry with a paddle brush for smooth results or air-dry for a more natural finish.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'low',
      partingPattern: 'center',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 8 — Straight/female
  {
    name: 'Elegant Long Brunette in Navy Sleeveless Dress',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/37177454/pexels-photo-37177454.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 70,
    ai_description: `### Title: Elegant Long Brunette in Navy Sleeveless Dress

### Overview
An elegant portrait of a woman with long, straight brown hair that flows past the shoulders with a silky, healthy appearance. The hair is a rich, warm brunette — medium to dark brown with natural depth and dimension. The styling is classic and refined: a natural side part with hair cascading smoothly down both sides, framing the face gracefully. The hair has visible body and movement without being overly voluminous — it sits naturally, with a gentle sway that suggests healthy, well-cared-for hair. Paired with a sleeveless navy dress, the overall aesthetic is sophisticated, polished, and timelessly elegant. The length extends to the mid-back, making it a true long-hair statement.

### Styling Details
- Long straight hair extending to mid-back, approximately 16-18 inches
- Rich, warm medium-to-dark brunette color
- Natural side part with hair falling on both sides of the face
- Smooth, silky texture with natural movement and body
- Subtle layering that allows the hair to move naturally
- Healthy, glossy finish with visible light reflection
- No visible color treatment — natural brunette depth
- Gentle face-framing from the natural fall of the hair
- Clean, tapered ends with no split ends visible
- Minimal styling — this is clean, well-maintained long hair at its best

### Ideal For
All face shapes. Long straight hair is universally flattering and timeless. Particularly stunning on oval and heart face shapes where the length creates beautiful vertical lines. Maintenance involves regular trims, quality conditioner, and a light shine serum. A classic look that never goes out of style.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 9 — Fashion/female
  {
    name: 'Fiery Red Ringlet Curls with Studio Contrast',
    category: 'Fashion',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/12148956/pexels-photo-12148956.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 61,
    ai_description: `### Title: Fiery Red Ringlet Curls with Studio Contrast

### Overview
A captivating close-up portrait featuring a woman with vibrant red curly hair that commands attention. The curls are tight, well-defined ringlets that cascade around the face and shoulders with incredible volume and definition. The red color is intense and multi-dimensional — ranging from deep auburn at the roots to bright copper and fiery red at the mid-lengths and ends. Each curl is individually defined, bouncy, and full of life. Shot with dramatic studio lighting, the red tones are amplified and the curl definition is razor-sharp. The subject wears a simple black top that serves as the perfect dark canvas for the explosive red curls.

### Styling Details
- Medium-length tight ringlet curls, approximately 10-12 inches when stretched
- Vivid red-to-copper color with multi-dimensional tonal variations
- Type 3B-3C tight, bouncy ringlet curl pattern
- Incredible volume creating a wide, dramatic silhouette
- Each curl individually defined with visible curl cream application
- No visible frizz — hydrated, well-maintained curls
- Natural part obscured by voluminous curl canopy
- Dark roots transitioning to brighter red through the lengths
- Curls frame the face on all sides creating a halo effect
- Dramatic studio lighting emphasizing the red metallic tones

### Ideal For
Oval, square, and oblong face shapes. The voluminous curls add width and softness to angular features. A high-impact fashion statement that works for editorial shoots, creative events, and anyone who wants their hair to be the conversation starter. Maintain with curl cream, diffuser drying, and minimal touching to preserve definition.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'free-form',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'auburn',
      hasColorTreatment: true,
      colorNotes: 'Vivid red-to-copper multi-dimensional color with darker auburn roots',
      promptFamily: 'standard',
    },
  },

  // 10 — Relaxed/female
  {
    name: 'Smiling Curly Brunette in Warm Studio Light',
    category: 'Relaxed',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/32117007/pexels-photo-32117007.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 66,
    ai_description: `### Title: Smiling Curly Brunette in Warm Studio Light

### Overview
A warm, inviting studio portrait of a woman with beautiful, natural curly brown hair and a genuine, radiant smile. The curls are loose and flowing — type 2C to 3A — creating soft, romantic waves that cascade past the shoulders. The color is a warm, rich medium brown with natural lighter strands that catch the warm studio lighting beautifully. The overall vibe is relaxed, approachable, and effortlessly beautiful. The curls have good definition without being overly styled — this is hair that looks naturally gorgeous. The warm studio tones complement the brown hair color perfectly, creating a cohesive, inviting image.

### Styling Details
- Shoulder-length to long curly hair, approximately 12-14 inches
- Warm medium brown color with natural sun-lightened strands
- Type 2C-3A loose curl pattern with soft, romantic waves
- Natural volume distributed evenly from roots to ends
- No defined part — curls fall naturally creating their own flow
- Healthy, hydrated curls with visible shine and bounce
- Face-framing curls that soften the forehead and cheekbones
- Minimal product — perhaps a light curl cream for definition
- Natural, unfussy styling that looks effortlessly beautiful
- Warm, approachable aesthetic enhanced by genuine smile

### Ideal For
All face shapes, particularly square and angular faces where the soft curls add roundness and femininity. A gorgeous everyday look for women with naturally curly hair who want to embrace their texture. Style with a curl-enhancing cream on damp hair, scrunch, and let air-dry for best results.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'free-form',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'medium-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

];

// ---------- Seed Runner ----------
async function seed() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ No MONGO_URI found in environment');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB\n');

  let created = 0;
  let skipped = 0;

  for (const style of newHairstyles) {
    console.log(`Processing: ${style.name} (${style.category}/${style.gender})`);

    const exists = await Hairstyle.findOne({ name: style.name });
    if (exists) {
      console.log(`  ⏩ Already exists — skipping`);
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

    console.log(`  ✅ Created: ${style.name}`);
    created++;
  }

  console.log(`\n🎉 Done — Created: ${created} | Skipped: ${skipped}`);
  const total = await Hairstyle.countDocuments();
  console.log(`📊 Total hairstyles in DB: ${total}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
