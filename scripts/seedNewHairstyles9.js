/**
 * Batch 9 Seed Script — 10 new hairstyles
 * DB before: ~129 total | Target after: ~139
 *
 * Category targets (filling under-represented):
 *   Twists (m) 1→2   |  Weaves (m) 1→2  |  Fashion (m) 1→2
 *   Coils (m) 3→4    |  Fades (f) 3→4   |  Modern (f) 4→5
 *   Modern (m) 4→5   |  Afros (m) 4→5   |  Relaxed (f) 5→6
 *   Locs (m) 5→6
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
  // 1 — Twists (male) — currently only 1
  {
    name: 'Neat Finger Coil Twists with Beard',
    category: 'Twists',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/20514563/pexels-photo-20514563.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 55,
    ai_description: `### Title: Neat Finger Coil Twists with Beard

### Overview
A clean, well-groomed look featuring tight finger coil twists across the top and crown of the head. The twists are uniform in size and neatly arranged, creating a textured, structured silhouette. Paired with a well-maintained full beard for a mature, polished masculine aesthetic.

### Styling Details
- Tight finger coil twists across the top, approximately 2-4 inches
- Twists set on damp hair with twist cream or gel for hold
- Sides kept slightly shorter to emphasize top texture
- Full beard trimmed and shaped to complement the hairstyle
- Light oil sheen for moisture and definition

### Ideal For
Oval, diamond, and square face shapes. A versatile style that works for professional and casual settings alike. The beard integration adds maturity and structure to the overall look.`,
    attributes: {
      hairType: 'twisted',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'none',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'other',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 2 — Weaves (male) — currently only 1
  {
    name: 'Sleek Cornrow Man Weave',
    category: 'Weaves',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/10143324/pexels-photo-10143324.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 48,
    ai_description: `### Title: Sleek Cornrow Man Weave

### Overview
A modern man weave featuring tightly braided cornrows that flow from front to back in clean, parallel lines. The side profile showcases the precision of the braiding pattern and the neat, sculpted shape it creates. This style bridges traditional braiding with contemporary male grooming trends.

### Styling Details
- Straight-back cornrows with even spacing from hairline to nape
- Medium-tension braiding for comfort and longevity
- Edges lined up sharply at the temple and nape
- Light edge control applied for a sleek, flyaway-free finish
- Can last 2-4 weeks with proper night care

### Ideal For
All face shapes, particularly long and oval. An excellent option for men wanting a protective style that's both fashionable and low-maintenance. Works well in professional and creative environments.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'cornrow',
      volumeProfile: 'flat',
      partingPattern: 'free-form',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 3 — Fashion (male) — currently only 1
  {
    name: 'Editorial Mohawk with Leather Accent',
    category: 'Fashion',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/33553635/pexels-photo-33553635.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 42,
    ai_description: `### Title: Editorial Mohawk with Leather Accent

### Overview
A bold, fashion-forward mohawk-inspired cut with dramatic height on top and closely cropped sides. The style is elevated with volume and texture on the central strip, creating a sculptural, editorial silhouette. Paired with a leather jacket, this look screams avant-garde confidence and creative expression.

### Styling Details
- Central mohawk strip with 4-6 inches of height, styled upward
- Sides tapered or shaved close for maximum contrast
- Top textured with curl sponge or twist-out for defined coils
- Strong-hold pomade or gel to maintain vertical shape
- Clean neckline and temple lineup

### Ideal For
Oval, heart, and diamond face shapes. A statement style for fashion-conscious men attending events, photoshoots, or creative gatherings. Not for the faint-hearted — this is a head-turner.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B',
      length: 'medium',
      fadeType: 'skin-fade',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // 4 — Coils (male) — currently 3
  {
    name: 'Defined Natural Coils with Hoodie Vibe',
    category: 'Coils',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/3966276/pexels-photo-3966276.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 58,
    ai_description: `### Title: Defined Natural Coils with Hoodie Vibe

### Overview
A natural, effortlessly cool look featuring well-defined coils worn at medium length. The hair showcases its natural 4B/4C texture with tight, springy coils that frame the forehead and temples. The casual hoodie pairing gives this look an approachable, everyday feel — proof that natural hair is always in style.

### Styling Details
- Natural coils at 3-5 inches, picked out for volume
- Defined with curl cream or shea butter for moisture and hold
- No chemical treatment — fully natural texture
- Rounded silhouette with even distribution
- Light oil for sheen and scalp health

### Ideal For
Round, oval, and heart face shapes. The ultimate low-maintenance natural style for men who want to embrace their texture without fuss. Perfect for students, creatives, and anyone who wants an authentic, grounded look.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 5 — Fades (female) — currently only 3
  {
    name: 'Bold Feminine Fade with Statement Fur',
    category: 'Fades',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/4063625/pexels-photo-4063625.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 50,
    ai_description: `### Title: Bold Feminine Fade with Statement Fur

### Overview
A striking, confident short cut featuring a close fade on the sides blending into a slightly longer textured top. The natural hair is kept at about half an inch on top with the coily texture visible and celebrated. Paired with a luxurious white fur accessory, this look transforms a simple short cut into a high-fashion statement.

### Styling Details
- Tapered fade on sides and back, clean around the ears
- Top kept at 0.5-1 inch with natural coily texture
- No chemical relaxing — embraces the natural curl pattern
- Clean edges along the hairline and nape
- Light moisturizer to keep coils defined and healthy

### Ideal For
All face shapes, especially oval, diamond, and heart. A powerful, liberating style for women who love short hair and want to make a bold impression. The fur accessory takes it from everyday to editorial.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4C',
      length: 'buzz',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'flat',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // 6 — Modern (female) — currently 4
  {
    name: 'Playful Double Afro Puffs',
    category: 'Modern',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/20756312/pexels-photo-20756312.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 62,
    ai_description: `### Title: Playful Double Afro Puffs

### Overview
An adorable yet stylish modern look featuring two symmetrical afro puffs positioned high on each side of the head. The puffs are full, round, and fluffy, showcasing gorgeous natural 4B/4C texture. The center part is clean and the overall vibe is youthful, fun, and effortlessly chic.

### Styling Details
- Hair parted down the center from forehead to nape
- Each section gathered into a high ponytail and fluffed into a round puff
- Edges smoothed with edge control for a polished finish
- Puffs shaped with a pick for maximum roundness and volume
- Light hold spray to maintain shape throughout the day

### Ideal For
All face shapes, particularly round and oval. A playful, carefree style that's perfect for weekends, festivals, brunches, and casual outings. Easy to achieve at home and requires zero heat.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'center',
      complexity: 'simple',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 7 — Modern (male) — currently 4
  {
    name: 'Retro Rounded Afro with Warm Studio Tones',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/9363545/pexels-photo-9363545.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 56,
    ai_description: `### Title: Retro Rounded Afro with Warm Studio Tones

### Overview
A perfectly shaped, medium-length afro with a retro vibe reminiscent of 70s soul. The hair forms a symmetrical dome of defined coils with impressive volume and roundness. The warm, moody studio lighting accentuates the texture and depth of the natural hair, creating an artistic, editorial quality.

### Styling Details
- Medium afro, approximately 4-6 inches all around
- Shaped with an afro pick for even, rounded silhouette
- Natural coily texture maintained without chemical treatment
- Moisturized with leave-in conditioner and sealed with oil
- Regular trimming to maintain the round dome shape

### Ideal For
Square, angular, and oblong face shapes — the round shape softens sharp features. A timeless style that bridges vintage and modern aesthetics. Perfect for men who want to make a cultural statement while looking effortlessly cool.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 8 — Afros (male) — currently 4
  {
    name: 'Sun-Kissed Natural Afro with Smile',
    category: 'Afros',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/28048494/pexels-photo-28048494.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 60,
    ai_description: `### Title: Sun-Kissed Natural Afro with Smile

### Overview
A vibrant, healthy natural afro worn with confidence and joy. The hair is medium-length with well-moisturized coils that catch the sunlight beautifully. The relaxed outdoor setting and warm smile make this look approachable and aspirational — a celebration of natural Black hair in its most authentic form.

### Styling Details
- Natural afro at 3-5 inches, shaped for even roundness
- Coils defined with leave-in conditioner and curl cream
- No heat styling — fully natural air-dried texture
- Edges natural and unfaded for a relaxed, organic look
- Regular moisturizing routine for healthy, bouncy curls

### Ideal For
All face shapes. The quintessential natural afro — timeless, confident, and universally flattering. Perfect for men who want to celebrate their natural texture in its most authentic form. Zero maintenance required beyond basic moisturizing.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 9 — Relaxed (female) — currently 5
  {
    name: 'Flowing Relaxed Layers in Amber',
    category: 'Relaxed',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/12560398/pexels-photo-12560398.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 54,
    ai_description: `### Title: Flowing Relaxed Layers in Amber

### Overview
A gorgeous, voluminous relaxed hairstyle with long, flowing layers that cascade past the shoulders. The hair is blow-dried with body and movement, featuring a warm amber-brown undertone that catches the light beautifully. The style is glamorous yet wearable — perfect for someone who wants to look effortlessly put together.

### Styling Details
- Long, layered relaxed hair extending to mid-back
- Blow-dried with a round brush for volume and bounce
- Side-swept bangs or face-framing layers for softness
- Warm amber/brown tonal highlights for dimension
- Finished with heat protectant and anti-humidity spray
- Regular deep conditioning to maintain relaxed hair health

### Ideal For
Round, heart, and square face shapes. A glamorous, versatile style that transitions beautifully from daytime professional to evening elegance. The warm tones add richness and depth to medium and deep skin tones.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'blow-out',
      volumeProfile: 'high',
      partingPattern: 'side-left',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: true,
      colorNotes: 'Warm amber/brown undertones and subtle highlights',
      promptFamily: 'standard',
    },
  },

  // 10 — Locs (male) — currently 5
  {
    name: 'Refined Shoulder-Length Locs',
    category: 'Locs',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/7431563/pexels-photo-7431563.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 58,
    ai_description: `### Title: Refined Shoulder-Length Locs

### Overview
Mature, well-maintained shoulder-length locs that exude confidence and sophistication. The locs are medium-thickness, neatly retwisted at the roots, and fall naturally past the ears to the shoulders. The overall presentation is polished and intentional — proving that locs can be just as refined as any conventional hairstyle.

### Styling Details
- Shoulder-length mature locs, approximately 10-14 inches
- Medium thickness, uniform sizing throughout
- Freshly retwisted roots for a clean, maintained appearance
- Natural black color with subtle brown tones from sun exposure
- Styled loose and flowing, parted naturally
- Regular palm-rolling and moisturizing routine

### Ideal For
All face shapes. A distinguished, timeless look for men in any profession. The shoulder length adds versatility — can be worn down, pulled back, or styled up for variety. Best suited for those committed to the loc journey (6+ months of growth).`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4A',
      length: 'long',
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
