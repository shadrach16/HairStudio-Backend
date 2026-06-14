/**
 * Batch 21 Seed Script — 10 new hairstyles from ANY categories
 * DB before: ~289 total | Target after: ~299
 *
 * Category / Gender distribution (targeting under-represented):
 *   Afros (f) x1    | Twists (f) x1    | Locs (f) x1
 *   Protective (m) x1 | Fashion (m) x1 | Coils (f) x2
 *   Bob (m) x1      | Twists (m) x1    | Weaves (m) x1
 *
 * All images sourced from Pexels (free license).
 * Each image verified for quality, clarity, and hairstyle visibility.
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
  // 1 — Afros (female) — Full voluminous afro on bold red background
  {
    name: 'Bold Full Afro with Vibrant Red Backdrop',
    category: 'Afros',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/32169693/pexels-photo-32169693.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 76,
    ai_description: `### Title: Bold Full Afro with Vibrant Red Backdrop

### Overview
A stunning, voluminous natural afro captured against a striking bold red background. The hair is perfectly rounded and symmetrical, forming a magnificent halo around the face. The dark, coily texture is healthy and well-moisturized, with each curl defined yet blending seamlessly into the overall shape. The vibrant red backdrop creates a powerful visual contrast that emphasizes the beauty and scale of the afro.

### Styling Details
- Full, rounded afro shape extending approximately 6-8 inches from the scalp
- Natural 4B/4C coily texture with well-defined shrinkage pattern
- Hair picked out and shaped with an afro pick for uniform volume
- Moisturized with leave-in conditioner and natural oils for sheen
- No heat or chemical processing — entirely natural
- Symmetrically shaped for a balanced, polished appearance
- Face fully visible with hair framing evenly on all sides

### Ideal For
Oval, heart, and diamond face shapes. A bold, empowering statement hairstyle that celebrates natural hair texture at its fullest. Requires regular deep conditioning and gentle detangling. Perfect for photo shoots, natural hair events, and anyone embracing their crown in its full glory.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B',
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

  // 2 — Twists (female) — Side profile with natural twist-out curls on brown bg
  {
    name: 'Elegant Twist-Out Profile with Warm Tones',
    category: 'Twists',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/14001839/pexels-photo-14001839.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 71,
    ai_description: `### Title: Elegant Twist-Out Profile with Warm Tones

### Overview
A beautifully captured side profile showcasing a lush twist-out hairstyle. The natural curls are defined and separated, creating a full, voluminous silhouette that extends from the crown down past the ears. The warm brown background complements the rich dark tones of the hair, while the side-angle photography highlights the depth and dimension of each curl. The subject's closed eyes and serene expression add an artistic, meditative quality.

### Styling Details
- Two-strand twist-out with well-defined, separated curls
- Natural 4A/4B texture with elongated curl pattern from the twisting process
- Medium length, approximately 6-8 inches when stretched
- Product-free look with natural sheen from leave-in conditioner
- Hair picked at the roots for maximum volume and lift
- No parting — hair flows naturally in all directions
- Side profile showcases the layered dimension of the curls

### Ideal For
All face shapes — the volume and dimension of a twist-out is universally flattering. A versatile natural hairstyle that can be dressed up or down. The twist-out technique protects the hair from daily manipulation while creating a gorgeous, defined curl pattern that lasts several days.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'twist-out',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 3 — Locs (female) — Side view, thick locs in blue turtleneck on plain bg
  {
    name: 'Thick Shoulder-Length Locs with Blue Turtleneck',
    category: 'Locs',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/8527551/pexels-photo-8527551.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 69,
    ai_description: `### Title: Thick Shoulder-Length Locs with Blue Turtleneck

### Overview
A refined side-view portrait showcasing thick, well-maintained shoulder-length locs. The dark locs fall naturally, with each loc approximately pencil-width and evenly formed, indicating mature, established locs. The subject wears a vibrant blue turtleneck sweater that creates a beautiful color contrast against the dark hair and neutral background. The side-angle captures the natural drape and weight of the locs beautifully.

### Styling Details
- Thick, mature locs approximately 8-10 inches in length
- Pencil-width diameter, evenly formed throughout
- Locs fall naturally without any particular styling arrangement
- Well-maintained with regular palm-rolling for neatness
- Natural dark color with no chemical treatment
- Clean, separated locs with no buildup visible
- Slightly pulled to one side for an asymmetric cascade effect

### Ideal For
All face shapes. A timeless, low-maintenance hairstyle that communicates strength and individuality. Mature locs at this length are versatile — they can be worn down, pulled up, or accessorized. The thick width gives substantial visual weight and presence.`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'palm-roll',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // 4 — Protective (male) — Young man with braided style, blue shirt indoors
  {
    name: 'Neat Cornrow Braids with Clean Edges',
    category: 'Protective',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/6698740/pexels-photo-6698740.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 72,
    ai_description: `### Title: Neat Cornrow Braids with Clean Edges

### Overview
A youthful, stylish close-up portrait of a young man wearing precise cornrow braids. The braids are neatly parted in straight rows running from the forehead to the back of the head, with clean, geometric lines visible between each row. The subject wears a casual blue button-up shirt and gazes directly at the camera with a warm, approachable expression. The indoor lighting creates a natural, lifestyle feel.

### Styling Details
- Straight-back cornrow braids, approximately 8-10 rows
- Clean geometric partings with even spacing between rows
- Braids follow the natural head shape from front to back
- Edges laid flat and smooth with edge control gel
- Short to medium hair length braided tightly to the scalp
- Natural dark hair color with no chemical treatment
- Fresh braids with no frizz or regrowth visible

### Ideal For
All face shapes — cornrows elongate the head shape and highlight facial features. A classic, versatile protective style perfect for active lifestyles. The straight-back pattern is timeless and works for both casual and professional settings. Maintenance-free for 2-3 weeks.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4B',
      length: 'short',
      fadeType: 'none',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'cornrow',
      volumeProfile: 'flat',
      partingPattern: 'geometric',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 5 — Fashion (male) — Man with purple dreadlocks, studio portrait
  {
    name: 'Purple-Tinted Freeform Locs with Studio Intensity',
    category: 'Fashion',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/9254556/pexels-photo-9254556.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 73,
    ai_description: `### Title: Purple-Tinted Freeform Locs with Studio Intensity

### Overview
A striking studio portrait featuring a young man with distinctive purple-tinted freeform locs. The locs are medium-length and tousled upward and to the sides, creating a wild, artistic silhouette. The purple color is vivid and eye-catching, applied as a full-head treatment that covers the natural dark base. The subject wears a simple black crew-neck shirt, allowing the dramatic hair color to be the focal point. The clean studio background and professional lighting create a high-fashion editorial mood.

### Styling Details
- Freeform locs with organic, irregular formations
- Vivid purple color treatment applied over natural dark hair
- Medium length, approximately 6-8 inches
- Tousled and lifted upward for maximum volume and visual impact
- Locs vary in width from pencil to finger-width for textural variety
- No formal parting — free-form growth pattern
- Color maintained with semi-permanent dye for vibrancy

### Ideal For
Oval, rectangular, and angular face shapes. A bold, artistic fashion statement that combines loc culture with high-fashion color artistry. The purple tint makes this ideal for creative professionals, performers, and anyone who wants their hairstyle to be their signature. Requires regular color refreshing every 4-6 weeks.`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4C',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'free-form',
      volumeProfile: 'high',
      partingPattern: 'free-form',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'purple',
      hasColorTreatment: true,
      promptFamily: 'locs',
    },
  },

  // 6 — Coils (female) — Confident woman with natural afro/coils, minimalist bg
  {
    name: 'Defined Natural Coils with Confident Glow',
    category: 'Coils',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/29667967/pexels-photo-29667967.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 70,
    ai_description: `### Title: Defined Natural Coils with Confident Glow

### Overview
A radiant portrait of a confident woman showcasing beautifully defined natural coils. The hair is styled into a rounded, full shape that frames the face symmetrically. Each coil is well-moisturized and individually defined, catching the light to create a gorgeous interplay of shadows and highlights. The minimalist background keeps all attention on the stunning natural texture and the subject's warm, self-assured expression.

### Styling Details
- Defined finger coils throughout, approximately 4-6 inches when stretched
- Natural 4A/4B texture with tight, springy coil pattern
- Shingling method used for individual coil definition
- Moisturized with curl cream and sealed with natural oil
- Rounded overall shape achieved with strategic stretching at the roots
- No heat or chemical processing — fully natural
- Symmetrical framing around the face

### Ideal For
Oval, round, and heart face shapes. A beautiful celebration of natural texture that requires patience in styling but rewards with stunning definition. The coils create a polished, editorial look while maintaining a completely natural appearance. Best achieved on wash day with proper product application.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'finger-coils',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 7 — Bob (male) — Side profile man with braided hair, dark background
  {
    name: 'Side-Swept Braided Bob with Masculine Edge',
    category: 'Bob',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/31112971/pexels-photo-31112971.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 67,
    ai_description: `### Title: Side-Swept Braided Bob with Masculine Edge

### Overview
A dramatic side profile portrait showcasing a man with a chin-length braided bob. The hair is styled in multiple thin braids that fall to just past the jawline, creating a modern masculine bob silhouette. The dark background and side-angle photography emphasize the clean lines of the braids and the angular profile of the subject. He wears a striped button-up shirt that adds a fashion-forward element to the overall look.

### Styling Details
- Multiple thin braids falling to chin/jaw length, approximately 4-5 inches
- Braids styled to one side for an asymmetric, swept effect
- Clean hairline visible at the temples and sideburns
- Natural dark hair color with no chemical treatment
- Braids are uniform in width, approximately pinky-finger thickness
- Loose ends allowed to fall naturally for a relaxed finish
- Side part creating a directional sweep to the left

### Ideal For
Oval, square, and angular face shapes. A unique, fashion-forward style that combines the protective benefits of braiding with a contemporary bob shape. The chin-length works well for men who want length without excessive maintenance. Ideal for creative and fashion-conscious individuals.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4B',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'box-braid',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 8 — Twists (male) — Young man with dreadlocks studio portrait, grey bg
  {
    name: 'Tapered Shoulder-Length Twists with Studio Poise',
    category: 'Twists',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/5904016/pexels-photo-5904016.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 68,
    ai_description: `### Title: Tapered Shoulder-Length Twists with Studio Poise

### Overview
A polished studio portrait of a young man with well-maintained shoulder-length two-strand twists. The twists hang naturally, framing the face and falling past the ears to the shoulders. Each twist is neatly formed and uniform in size, demonstrating careful maintenance and styling. The subject wears a simple black crew-neck shirt against a neutral studio background, keeping the focus entirely on the hairstyle.

### Styling Details
- Two-strand twists throughout, each approximately 8-10 inches long
- Uniform twist width, approximately pencil-thickness
- Natural dark brown/black color with healthy sheen
- Twists fall naturally with gravity, creating a cascading effect
- No accessories or color treatments — purely structural beauty
- Subtle taper at the nape for a clean, polished finish
- Hair parted loosely for even distribution of twists around the head

### Ideal For
All face shapes. Two-strand twists are a versatile protective style that works year-round. The shoulder length adds visual weight and presence while remaining manageable. Can be worn down as shown, or pulled up into a top knot for variety. A stylish choice for men who want a natural, cultured look.`,
    attributes: {
      hairType: 'twisted',
      hairTexture: '4B',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'twist-out',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 9 — Coils (female) — Close-up woman with natural curls, neutral backdrop
  {
    name: 'Springy Wash-and-Go Coils with Natural Radiance',
    category: 'Coils',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/33277965/pexels-photo-33277965.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 72,
    ai_description: `### Title: Springy Wash-and-Go Coils with Natural Radiance

### Overview
An intimate close-up portrait capturing the exquisite detail of natural springy coils in a wash-and-go style. The hair has a gorgeous, well-defined curl pattern with individual coils clearly visible and bouncy. The neutral backdrop and soft, natural lighting create a warm, inviting atmosphere that highlights the hair's natural texture and the subject's captivating eyes. This is natural hair at its most beautiful — unmanipulated and celebrated.

### Styling Details
- Wash-and-go styling with naturally defined coils
- 3C/4A curl pattern with tight, springy coils
- Approximately 5-7 inches when stretched, 3-4 inches with natural shrinkage
- Styled with curl-defining gel applied to soaking wet hair
- Air-dried for maximum natural definition
- No heat, no chemical relaxing — fully natural process
- Hair frames the face evenly, pulled slightly to one side

### Ideal For
Oval, heart, and oblong face shapes. The ultimate low-manipulation style that showcases natural texture in its purest form. A wash-and-go is perfect for anyone who wants to embrace their curls with minimal effort. The key is in the product application — generous gel on soaking wet hair, then hands-off drying.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3C',
      length: 'medium',
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
      promptFamily: 'natural-textured',
    },
  },

  // 10 — Weaves (male) — Man with braided hair and beads, side portrait
  {
    name: 'Beaded Braids with Cultural Artistry',
    category: 'Weaves',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/15787297/pexels-photo-15787297.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 69,
    ai_description: `### Title: Beaded Braids with Cultural Artistry

### Overview
A striking side portrait of a young man adorned with elaborately beaded braids that hang past the jawline. The braids are decorated with wooden and metallic beads at the tips and along the strands, creating a culturally rich and visually stunning presentation. The warm natural lighting highlights the texture of each braid and the reflective quality of the beads. The subject's composed side profile against a softly blurred background creates an artistic, editorial quality.

### Styling Details
- Multiple thin braids, approximately 6-8 inches long
- Wooden and metallic bead accents threaded onto braid ends
- Natural dark hair braided from roots to tips
- Braids fall freely from a loose free-form parting
- Cultural-inspired bead placement with intentional design
- Hair well-moisturized before braiding for longevity
- No fade or undercut — all hair incorporated into braids

### Ideal For
All face shapes. A culturally expressive hairstyle that combines protective braiding with decorative artistry. The beaded accents make this suitable for cultural celebrations, festivals, and creative environments. The braids protect the hair while the beads add personality and individual expression.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4C',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'box-braid',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
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
  console.error('Fatal:', err);
  process.exit(1);
});
