/**
 * Batch 19 Seed Script — 10 new NON-AFRICAN hairstyles
 * DB before: ~269 total | Target after: ~279
 *
 * All non-African styles with diverse categories:
 *   Traditional (f) x2 | Traditional (m) x1 | Fashion (f) x1
 *   Protective (f) x1  | Relaxed (f) x1     | Straight (f) x1
 *   Straight (m) x1    | Low Cut (m) x1     | Modern (m) x1
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
  // 1 — Traditional (female) — Elegant intricate updo with sophisticated makeup
  {
    name: 'Sophisticated Chignon with Sculpted Waves',
    category: 'Traditional',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/36526903/pexels-photo-36526903.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 73,
    ai_description: `### Title: Sophisticated Chignon with Sculpted Waves

### Overview
An exquisitely crafted chignon updo featuring sculpted finger waves that sweep from the temples into a low, polished bun at the nape. The dark brunette hair is sleek and glossy, with every wave precisely placed for a vintage-meets-modern look. Paired with dramatic smoky eye makeup and bold red lips, this is a red-carpet-ready statement hairstyle.

### Styling Details
- Low chignon positioned at the nape of the neck
- Sculpted finger waves sweeping from the temple to the bun
- Hair set with setting lotion and pinned to create defined wave ridges
- High-gloss finish achieved with shine serum and light-hold spray
- Dark brunette color, natural and uniform
- Face-framing sections tucked behind the ears for clean lines

### Ideal For
Oval, heart, and diamond face shapes. A formal hairstyle perfect for galas, weddings, and black-tie events. The sculpted waves add a timeless Art Deco quality while the low chignon keeps the look elegant and refined.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'low',
      partingPattern: 'side-left',
      complexity: 'highly-intricate',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 2 — Traditional (male) — Slicked-back dark hair with blazer
  {
    name: 'Classic Slicked-Back Gentleman with Dark Finish',
    category: 'Traditional',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/5337943/pexels-photo-5337943.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 67,
    ai_description: `### Title: Classic Slicked-Back Gentleman with Dark Finish

### Overview
A timeless slicked-back hairstyle worn by a well-groomed man in a black shirt. The dark brown hair is brushed smoothly backward from the forehead, creating a sleek, aerodynamic silhouette. The back view reveals precise tapering at the neckline with the hair lying flat and controlled, demonstrating excellent barber finishing.

### Styling Details
- Hair slicked straight back from the hairline, approximately 4-5 inches on top
- Tapered neckline with clean, precise finishing
- Styled with high-hold, high-shine pomade for the wet-look finish
- No parting — hair flows uniformly backward
- Natural dark brown color with no chemical treatment
- Sides blended smoothly into the back without a fade

### Ideal For
Oval, rectangular, and angular face shapes. A power hairstyle that communicates confidence and authority. Ideal for formal events, business settings, and anyone who wants a refined, retro-inspired look that never goes out of style.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C',
      length: 'medium',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 3 — Protective (female) — Classic pearl updo, vintage elegance
  {
    name: 'Vintage Pearl-Adorned French Twist',
    category: 'Protective',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/30325907/pexels-photo-30325907.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 69,
    ai_description: `### Title: Vintage Pearl-Adorned French Twist

### Overview
A glamorous vintage-inspired updo featuring a refined French twist with pearl strand accents woven through the hair. The dark hair is swept up elegantly, exposing the neck and shoulders, with red lipstick completing the Old Hollywood aesthetic. The pearls add a luxurious, bridal quality that elevates this from a simple updo to a statement piece.

### Styling Details
- Classic French twist with hair rolled inward and pinned vertically
- Pearl strands threaded through the twist for decorative accent
- Smooth, polished surface with no flyaways
- Face-framing tendrils left loose at the temples for softness
- Secured with bobby pins and a light-hold finishing spray
- Natural dark hair color, glossy finish

### Ideal For
All face shapes, especially heart and oval. A show-stopping bridal or formal event hairstyle that combines classic technique with decorative elements. The exposed neckline makes it perfect for pairing with statement necklaces or off-shoulder gowns.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'low',
      partingPattern: 'side-left',
      complexity: 'highly-intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'protective-install',
    },
  },

  // 4 — Straight (female) — Brunette with long layered bangs, studio
  {
    name: 'Dramatic Long Bangs with Layered Brunette Fall',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/20858260/pexels-photo-20858260.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 64,
    ai_description: `### Title: Dramatic Long Bangs with Layered Brunette Fall

### Overview
A striking, edgy look featuring dramatically long curtain bangs that sweep across the forehead and frame the eyes. The dark brunette hair falls in soft layers past the shoulders with a natural, lived-in texture. The moody studio lighting with purple tones highlights the depth and dimension of the dark hair. This is a style that balances grunge edge with feminine softness.

### Styling Details
- Long curtain bangs sweeping to eye level, approximately 5-6 inches
- Layered mid-length hair falling past the shoulders
- Air-dried or lightly blow-dried for a natural, tousled finish
- No chemical treatment — natural dark brunette color
- Center-to-slightly-off-center part that allows bangs to split naturally
- Minimal product — relies on the cut structure for movement

### Ideal For
Round, oval, and square face shapes. The long bangs create a face-slimming frame while the layers add movement. Perfect for creative and artistic individuals who want a low-maintenance yet impactful hairstyle with edge.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 5 — Fashion (female) — Rose-shaped updo with fur coat
  {
    name: 'Sculpted Rose Bun with Fur Jacket Glamour',
    category: 'Fashion',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/11654507/pexels-photo-11654507.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 75,
    ai_description: `### Title: Sculpted Rose Bun with Fur Jacket Glamour

### Overview
A breathtaking, avant-garde updo where the hair is sculpted into an intricate rose-like formation at the back of the head. The dark hair is twisted and pinned to create layered petals that spiral outward like a blooming flower. Paired with a luxurious grey fur jacket, this editorial-level hairstyle is the definition of high fashion meets hair art.

### Styling Details
- Hair sectioned and individually twisted into petal shapes
- Each petal pinned concentrically to form a 3D rose silhouette
- Base secured with strong-hold gel and multiple bobby pins
- Smooth, polished finish with anti-frizz serum
- Natural dark hair color with no color treatment
- Requires professional stylist for precise petal shaping

### Ideal For
All face shapes. This is not an everyday style — it's reserved for runway shows, fashion editorials, galas, and special events where you want to be the most memorable person in the room. A true hair sculpture that doubles as wearable art.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'highly-intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 6 — Relaxed (female) — Retro swept bangs with blazer
  {
    name: 'Retro Side-Swept Bangs with Polished Layers',
    category: 'Relaxed',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/9066304/pexels-photo-9066304.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 63,
    ai_description: `### Title: Retro Side-Swept Bangs with Polished Layers

### Overview
A sophisticated retro-inspired look featuring deep side-swept bangs that curve gracefully across the forehead. The auburn-brunette hair is blown out smooth with polished layers that flip outward at the ends, creating an elegant 1960s silhouette. The model's blazer and red lipstick complete the timeless, put-together aesthetic with effortless European style.

### Styling Details
- Deep side part with long, sweeping bangs across the forehead
- Hair blown out with a round brush for smooth body and movement
- Ends styled outward in a retro flip at chin to shoulder length
- Warm auburn-brunette tone — likely enhanced with semi-permanent gloss
- Finished with medium-hold hairspray to maintain the sweep
- Clean, polished surface with no visible frizz

### Ideal For
Square, round, and wide face shapes. The side-swept bangs create a diagonal line that slims the face. A versatile style that transitions beautifully from office to evening — classic, polished, and never dated.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'blow-out',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: true,
      colorNotes: 'Warm auburn-brunette gloss tint',
      promptFamily: 'standard',
    },
  },

  // 7 — Traditional (female) — Blonde braided updo, studio close-up
  {
    name: 'Woven Blonde Crown Braid Updo',
    category: 'Traditional',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/10239026/pexels-photo-10239026.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 70,
    ai_description: `### Title: Woven Blonde Crown Braid Updo

### Overview
A beautifully intricate crown braid updo created with thick, blonde hair woven in a halo pattern around the head. The braids are large and chunky, giving a textured, organic look reminiscent of European folk traditions. The platinum-to-golden blonde color adds warmth and dimension, while the studio setting shows every detail of the weaving pattern.

### Styling Details
- Hair sectioned and French-braided around the crown of the head
- Thick three-strand braids with hair pulled in from both sides
- Braids meet at the back and are pinned underneath for a seamless circle
- Loose face-framing wisps left at the temples for softness
- Platinum blonde with golden and honey undertones
- Secured with bobby pins and light finishing spray

### Ideal For
Oval, round, and heart face shapes. A romantic, bohemian style perfect for outdoor weddings, garden parties, music festivals, and any event where a natural, fairy-tale aesthetic is desired. Can be achieved on medium to long hair.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'other',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'platinum-blonde',
      hasColorTreatment: true,
      colorNotes: 'Platinum blonde with golden and honey undertones',
      promptFamily: 'standard',
    },
  },

  // 8 — Low Cut (male) — Clean buzz cut, natural light portrait
  {
    name: 'Clean Military Buzz Cut with Natural Glow',
    category: 'Low Cut',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/11744656/pexels-photo-11744656.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 58,
    ai_description: `### Title: Clean Military Buzz Cut with Natural Glow

### Overview
A clean, classic military-style buzz cut shown on a young Caucasian man in natural light. The hair is uniformly clipped to approximately one-quarter inch all around, following the natural contour of the head perfectly. The simplicity of the cut highlights the model's strong jawline and bone structure. This is grooming at its most elemental — no frills, just precision.

### Styling Details
- Uniform buzz cut at #2 guard length (~1/4 inch) all over
- No fade, no taper — same length from crown to nape
- Natural hairline with no lineup or shaping
- No product needed — zero-maintenance styling
- Natural light brown hair color
- Clean-shaven face emphasizing the minimalist aesthetic

### Ideal For
Oval, square, and strong-jawed face shapes. The ultimate low-maintenance cut for men who value simplicity and clean lines. Perfect for athletes, military personnel, and anyone who wants a sharp, no-fuss look that requires absolutely no daily styling.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'buzz',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'flat',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'light-brown',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // 9 — Modern (male) — Long curly dark hair, moody studio
  {
    name: 'Flowing Dark Curls with Studio Moodiness',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/17434252/pexels-photo-17434252.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 66,
    ai_description: `### Title: Flowing Dark Curls with Studio Moodiness

### Overview
A dramatic, editorial portrait of a young man with long, flowing curly hair that cascades past his shoulders. The dark curls are defined yet voluminous, creating an artistic, rock-star silhouette against moody low-light studio tones. The hair's natural wave pattern is celebrated with no attempt to straighten or control — this is wild, free, and unapologetically bold.

### Styling Details
- Long curly hair falling to shoulder length and beyond, approximately 12-16 inches
- Natural curl pattern ranging from 2B to 3A waves and ringlets
- Air-dried to maintain natural curl definition and volume
- Minimal product — light curl cream or leave-in conditioner
- Natural dark brown/black color with no chemical treatment
- No parting — hair falls forward and to the sides naturally

### Ideal For
Square, angular, and oblong face shapes. The volume and length soften sharp features and add a romantic, artistic quality. Perfect for musicians, creatives, and men who embrace longer hair as a form of self-expression.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3A',
      length: 'long',
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

  // 10 — Straight (male) — Curly-haired man with beard, dramatic lighting
  {
    name: 'Mediterranean Curly Mop with Full Beard',
    category: 'Straight',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/15040111/pexels-photo-15040111.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 62,
    ai_description: `### Title: Mediterranean Curly Mop with Full Beard

### Overview
A striking portrait of a Middle Eastern or Mediterranean man with a voluminous mop of tight, dark curls paired with a full, well-groomed beard. The dramatic side lighting creates deep shadows that accentuate the texture and depth of the curly hair and facial hair. The gold earring adds an edge of personality to this ruggedly handsome look.

### Styling Details
- Dense, tight curls at 3-4 inches creating a voluminous top
- Natural 3B/3C curl pattern with defined ringlets
- Sides slightly shorter but still curly, no fade
- Full beard shaped and groomed to complement the hair volume
- Natural dark brown/black color
- Styled with curl-defining cream for separation and moisture
- Gold hoop earring for style accent

### Ideal For
Round, oval, and heart face shapes. The volume on top elongates the face while the full beard adds masculine structure. A naturally textured look that celebrates curly hair without fighting it — just good grooming and confidence.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3B',
      length: 'short',
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
      promptFamily: 'natural-textured',
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
