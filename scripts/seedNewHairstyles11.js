/**
 * Batch 11 Seed Script — 10 new NON-AFRICAN hairstyles
 * DB before: ~309 total | Target after: ~319
 *
 * Focus: Asian, European, Latin hairstyles
 * Categories spread: Bob(2), Straight(3), Modern(2), Fashion(2), Fades(1)
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
  // 1 — Straight/male — European slicked-back
  {
    name: 'European Slicked-Back with Dark Studio Intensity',
    category: 'Straight',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/5337943/pexels-photo-5337943.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 55,
    ai_description: `### Title: European Slicked-Back with Dark Studio Intensity

### Overview
A clean, polished slicked-back hairstyle on a young man with dark brown hair, captured in a dramatic studio setting. The hair is combed straight back from the forehead with pomade or gel, creating a glossy, sculpted look that emphasizes the facial features and jawline. The dark background and black shirt create a high-contrast editorial aesthetic that showcases this timeless European gentleman's style.

### Styling Details
- Medium-length hair (3-5 inches on top) slicked straight back
- High-hold pomade or gel applied to towel-dried hair for glossy finish
- Hair combed back uniformly from the forehead to the crown
- Sides kept shorter and blended into the slicked-back top
- Clean neckline and natural temple line
- No visible parting — fully swept back
- Finished with a light-hold hairspray for all-day hold

### Ideal For
Oval, square, and oblong face shapes. A classic, timeless style that projects confidence and sophistication. Perfect for formal events, business settings, or anyone wanting a polished, put-together look with minimal daily effort once mastered.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'flat-iron',
      volumeProfile: 'flat',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 2 — Fades/male — Caucasian clean taper with slicked side
  {
    name: 'Clean Caucasian Taper with Side-Swept Volume',
    category: 'Fades',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/9102985/pexels-photo-9102985.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 52,
    ai_description: `### Title: Clean Caucasian Taper with Side-Swept Volume

### Overview
A well-groomed Caucasian man with blue-gray eyes sporting a clean, tapered hairstyle with the top swept back and to the side. The hair is light brown with natural texture, longer on top (3-4 inches) and neatly tapered at the sides and back. The gray henley shirt creates a casual-yet-refined vibe. This is the quintessential modern European male haircut — low maintenance, universally flattering, and endlessly versatile.

### Styling Details
- Top length 3-4 inches, swept back and slightly to the side
- Sides tapered with clipper-over-comb technique, blending naturally
- No hard lines or disconnections — seamless gradient
- Light-hold matte pomade for natural texture and movement
- Hair blow-dried back for volume at the roots
- Clean natural hairline — no edging or razor work
- Ears exposed with clean outline around them

### Ideal For
All face shapes, particularly round and oval. The tapered sides create length while the volume on top adds height. A go-to barbershop style for professional men who want something sharp without being dramatic. Transitions easily from office to weekend.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'short',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'blow-out',
      volumeProfile: 'medium',
      partingPattern: 'side-right',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      colorNotes: 'Light brown natural color',
      promptFamily: 'standard',
    },
  },

  // 3 — Bob/female — Asian blunt bob with bangs
  {
    name: 'Polished Asian Bob with Blunt-Cut Bangs',
    category: 'Bob',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/14943471/pexels-photo-14943471.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 58,
    ai_description: `### Title: Polished Asian Bob with Blunt-Cut Bangs

### Overview
A sleek, precision-cut bob on an East Asian woman featuring jet-black, pin-straight hair at chin-length with thick, blunt-cut bangs that sit just above the eyebrows. The cut is perfectly symmetrical and impossibly smooth, showcasing the natural density and shine of Asian hair. The blunt ends create a strong, graphic silhouette that frames the face with geometric precision.

### Styling Details
- Chin-length blunt bob with zero layering
- Thick, straight-across bangs cut just above the eyebrows
- Pin-straight texture achieved with flat-iron or natural Asian hair texture
- Ends cut with precision shears for a razor-sharp line
- High-gloss finish from smoothing serum or argan oil
- Center back slightly shorter for a subtle A-line effect
- Ears covered for a face-framing effect

### Ideal For
Round, heart, and oval face shapes. The blunt bangs create a frame that draws attention to the eyes, while the chin-length cut balances fuller cheeks. A timeless East Asian beauty staple that works for all ages and settings — from Tokyo streetwear to corporate boardrooms.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'flat-iron',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 4 — Straight/female — Long silky brunette Asian
  {
    name: 'Silky Long Brunette with Effortless Studio Glow',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/8485330/pexels-photo-8485330.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 60,
    ai_description: `### Title: Silky Long Brunette with Effortless Studio Glow

### Overview
Gorgeous, ultra-long straight dark brown hair cascading past the shoulders on a Southeast Asian woman. The hair is naturally thick, healthy, and impossibly smooth with a subtle natural sheen that catches the studio light beautifully. Worn loose with a soft center part, this is hair at its most natural and healthy — no elaborate styling needed. The dark background and gray v-neck top let the hair be the undeniable star.

### Styling Details
- Extra-long length (20+ inches), falling to mid-back
- Natural center part with hair flowing evenly on both sides
- Subtle natural wave at the very ends from the hair's own weight
- No heat styling visible — natural straight texture maintained
- High shine from consistent deep conditioning routine
- Blunt-cut ends for a thick, healthy appearance
- No layers — one-length cut for maximum density appearance

### Ideal For
All face shapes. Long straight hair is universally versatile — can be worn down, up, braided, or styled countless ways. This length and health level requires consistent maintenance (trims, conditioning, protection) but the payoff is undeniable glamour with zero daily effort.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'extra-long',
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

  // 5 — Modern/female — Latina bouncy curls outdoor
  {
    name: 'Sun-Kissed Latina Curls with Natural Bounce',
    category: 'Modern',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/15915500/pexels-photo-15915500.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 62,
    ai_description: `### Title: Sun-Kissed Latina Curls with Natural Bounce

### Overview
Beautiful, voluminous natural curls on a Latina woman, captured in warm outdoor sunlight that highlights golden and caramel undertones throughout the hair. The curls are loose, bouncy, and well-defined — a mix of 2C/3A texture that cascades past the shoulders with incredible body and movement. The sunlit setting and natural expression capture the effortless beauty of embracing one's natural curl pattern.

### Styling Details
- Shoulder-length to chest-length loose curls (2C/3A pattern)
- Natural caramel and golden highlights from sun exposure
- Defined with curl cream and scrunching technique
- Air-dried for natural bounce and movement
- No crunchy gel cast — soft, touchable finish
- Volume concentrated at the mid-lengths and ends
- Center part with curls framing the face on both sides

### Ideal For
All face shapes. Loose curls are universally flattering and create instant dimension and interest. This style celebrates natural Latin texture with minimal manipulation — wash-and-go at its finest. Perfect for women who want to enhance their natural curl pattern rather than fight it.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'center',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: true,
      colorNotes: 'Natural sun-kissed caramel and golden highlights',
      promptFamily: 'natural-textured',
    },
  },

  // 6 — Fashion/female — Glamorous curls with hoops
  {
    name: 'Glamorous Defined Curls with Statement Hoops',
    category: 'Fashion',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/8078836/pexels-photo-8078836.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 56,
    ai_description: `### Title: Glamorous Defined Curls with Statement Hoops

### Overview
A stunning portrait showcasing meticulously defined curls on a young Latina woman with elegant makeup and bold gold hoop earrings. The curls are perfectly spiraled, creating a cascade of defined ringlets from root to ends. The combination of polished makeup, statement jewelry, and flawless curls creates a high-fashion editorial look that bridges everyday beauty with runway glamour.

### Styling Details
- Medium-length defined curls (3A/3B pattern) at shoulder-length
- Each curl individually defined using finger-coiling or denman brush technique
- Strong-hold gel applied to soaking wet hair for maximum definition
- Diffused on medium heat for set without frizz
- Glossy finish from curl-defining cream layered under gel
- Side part with curls falling asymmetrically
- Edges smooth with no flyaways — polished finish throughout

### Ideal For
Oval, heart, and diamond face shapes. A glamorous take on natural curls that elevates everyday texture into a red-carpet-ready look. The statement hoops complement the curls perfectly — showing how accessories and hair work together. Ideal for events, photoshoots, and nights out.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'finger-coils',
      volumeProfile: 'high',
      partingPattern: 'side-left',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 7 — Bob/female — Short layered brunette crop
  {
    name: 'Layered Brunette Crop with Casual Side Sweep',
    category: 'Bob',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/9514641/pexels-photo-9514641.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 50,
    ai_description: `### Title: Layered Brunette Crop with Casual Side Sweep

### Overview
A chic, textured short crop on a Caucasian woman with warm brown hair, styled with effortless side-swept layers. The cut is a modern take on the classic pixie-to-bob transition — short enough to be low-maintenance but long enough to style in different directions. Paired with a blue floral shirt and white blazer, the overall vibe is professional yet creative — the hair of a woman who values both style and practicality.

### Styling Details
- Short layered crop, approximately 3-4 inches on top
- Textured layers for movement and dimension
- Side-swept fringe that blends into the longer top layers
- Sides and back slightly shorter, tapered naturally
- Light texturizing paste for piecey definition
- Air-dried with fingers for an undone, lived-in look
- Natural brown color with warm undertones

### Ideal For
Oval, heart, and angular face shapes. A versatile short style that works across seasons and settings — from casual weekends to professional meetings. The textured layers add volume and interest without requiring daily blow-drying. Perfect for women who want short hair without committing to a pixie.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: true,
      colorNotes: 'Warm brown with natural undertones',
      promptFamily: 'standard',
    },
  },

  // 8 — Modern/male — Blonde contemplative side sweep
  {
    name: 'Nordic Blonde Layers with Contemplative Profile',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/4651422/pexels-photo-4651422.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 48,
    ai_description: `### Title: Nordic Blonde Layers with Contemplative Profile

### Overview
A natural blonde medium-length hairstyle on a young Northern European man, captured in a moody profile portrait wearing a beige overcoat. The hair is a soft, natural blonde with gentle layering that creates movement and texture. Swept back and to the side in a relaxed, effortless way — this is the Scandinavian minimal aesthetic applied to grooming. No product overload, no forced styling — just clean, healthy hair worn naturally.

### Styling Details
- Medium-length blonde hair (4-5 inches), layered for movement
- Swept back loosely from the forehead with natural fall
- No visible product — matte, natural finish
- Layers create subtle volume and dimension
- Natural blonde color with cooler platinum undertones
- Ears partially visible with hair tucked behind on one side
- Textured ends from point-cutting technique

### Ideal For
Square, angular, and oblong face shapes. The soft layers and relaxed styling counterbalance strong features. A low-effort style that suits men who prefer a natural, unfussy approach to grooming. Works well with the Nordic/Scandinavian aesthetic — minimal, clean, intentional.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: true,
      colorNotes: 'Natural Nordic blonde with cool platinum undertones',
      promptFamily: 'standard',
    },
  },

  // 9 — Fashion/female — Rose pink layered cut
  {
    name: 'Rose Pink Medium Layers with Thoughtful Attitude',
    category: 'Fashion',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/18428653/pexels-photo-18428653.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 46,
    ai_description: `### Title: Rose Pink Medium Layers with Thoughtful Attitude

### Overview
A bold, fashion-forward look featuring medium-length hair dyed in a soft rose pink/pastel pink shade. The color is even and vibrant throughout, applied over pre-lightened hair for a true pastel effect. The layers fall at shoulder-length with a soft, piecey texture that gives the style movement and dimension. This is hair as self-expression — an artistic statement that combines technical color skill with creative vision.

### Styling Details
- Medium-length (shoulder-length) with soft layers
- Full-head rose pink/pastel pink color over pre-lightened base
- Soft, lived-in texture from air-drying or low-heat diffusing
- Side-swept fringe blending into longer face-framing layers
- Matte, touchable finish — not overly glossy
- Roots slightly darker for a natural-looking color melt
- Requires regular toning and color maintenance every 4-6 weeks

### Ideal For
All face shapes. A statement style for creative, fashion-forward women who want their hair to be an extension of their personality. The soft pink is surprisingly versatile — works with both warm and cool skin tones. Best suited for those willing to invest in color maintenance.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: true,
      colorNotes: 'Full pastel rose pink over pre-lightened blonde base',
      promptFamily: 'standard',
    },
  },

  // 10 — Straight/female — Dark elegant bangs with soft frame
  {
    name: 'Elegant Dark Bangs with Soft Angelic Frame',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/10426083/pexels-photo-10426083.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 54,
    ai_description: `### Title: Elegant Dark Bangs with Soft Angelic Frame

### Overview
A beautiful, soft hairstyle featuring long, dark straight hair with face-framing curtain bangs on a Southeast Asian woman. The bangs are parted softly in the center, sweeping to each side to frame the cheekbones and eyes with gentle curves. The rest of the hair falls long and smooth past the shoulders. The overall effect is ethereal and elegant — a romantic take on straight hair that adds dimension and softness to the face.

### Styling Details
- Long straight dark hair with soft curtain bangs
- Bangs parted slightly off-center, swept to frame the face
- Bangs length at cheekbone level for a face-framing effect
- Main length falls past the shoulders, naturally straight
- Subtle inward curl at the ends of the bangs from round-brush drying
- Glossy, healthy finish from smoothing serum
- Minimal layering through the lengths for a thick, dense appearance

### Ideal For
Square, round, and oblong face shapes. Curtain bangs soften angular features and create the illusion of an oval shape. A romantic, feminine style that elevates simple straight hair into something editorial. Low maintenance once the bangs are cut — just requires periodic bang trims every 3-4 weeks.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'blow-out',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'moderate',
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
  process.exit(0);
}

seed().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
