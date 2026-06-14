/**
 * Batch 10 Seed Script — 10 new hairstyles
 * DB before: ~299 total | Target after: ~309
 *
 * Category targets (filling under-represented):
 *   Bob (m) 5→6         |  Protective (m) 6→7  |  Weaves (m) 6→7
 *   Twists (f) 7→8      |  Locs (f) 7→8        |  Afros (f) 7→8
 *   Fades (f) 7→8       |  Coils (f) 9→10      |  Traditional (m) 10→11
 *   Low Cut (f) 9→10
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
  // 1 — Bob (male) — currently 5
  {
    name: 'Braided Chin-Length Bob with Warm Ambiance',
    category: 'Bob',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/32605503/pexels-photo-32605503.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 48,
    ai_description: `### Title: Braided Chin-Length Bob with Warm Ambiance

### Overview
A modern men's braided bob featuring neat, medium-sized box braids that fall to chin-length. The braids are uniform and well-maintained, framing the face with clean precision. Shot in a warm, moody setting, this style demonstrates how a chin-length braided bob can be both masculine and refined — a sophisticated protective style that doubles as a statement look.

### Styling Details
- Chin-length box braids, approximately 5-7 inches
- Medium-thickness braids with clean square partings
- Hair tucked behind the ear on one side for asymmetry
- Ends left blunt for a structured, polished finish
- Scalp well-moisturized between parts
- Style can last 4-6 weeks with proper maintenance

### Ideal For
Oval, square, and diamond face shapes. A versatile protective style for men who want length without commitment. Works beautifully in creative and professional environments, offering a polished yet expressive aesthetic.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4B',
      length: 'medium',
      fadeType: 'none',
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

  // 2 — Protective (male) — currently 6
  {
    name: 'Clean Cornrow Protective Set with Blue Knit',
    category: 'Protective',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/31023719/pexels-photo-31023719.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 55,
    ai_description: `### Title: Clean Cornrow Protective Set with Blue Knit

### Overview
A well-executed set of straight-back cornrows on a young man, photographed in a clean, professional portrait setting. The braids are tight, evenly spaced, and follow a classic all-back pattern from the hairline to the nape. Paired with a blue and white knit sweater, the overall look is youthful, well-groomed, and fashion-conscious while keeping the hair fully protected.

### Styling Details
- Straight-back cornrows with even spacing and consistent tension
- Clean hairline with sharp edges along the temple
- Braids extend to the nape in parallel rows
- Scalp is visible between rows, showing neat parting lines
- Low-maintenance protective style lasting 2-4 weeks
- Light oil applied to scalp for moisture and sheen

### Ideal For
All face shapes. A classic, universally flattering protective style that's ideal for active lifestyles and professional settings. The clean lines and symmetrical pattern project confidence and attention to detail.`,
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
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 3 — Twists (female) — currently 7
  {
    name: 'Radiant Two-Strand Twists with Pink Earrings',
    category: 'Twists',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/30091514/pexels-photo-30091514.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 60,
    ai_description: `### Title: Radiant Two-Strand Twists with Pink Earrings

### Overview
A joyful, radiant look featuring well-defined two-strand twists at shoulder-length. The twists are medium-sized with consistent coil pattern throughout, showcasing the natural texture beautifully. The subject's bright smile and statement pink earrings complete a look that's equally at home at brunch, the office, or a night out. The twists frame the face softly and have a natural, effortless bounce.

### Styling Details
- Medium two-strand twists at shoulder-length, approximately 8-12 inches
- Twisted on damp hair with twisting cream for hold and definition
- Ends left free for a tapered, natural finish
- Center parting with twists falling evenly on both sides
- Light oil sheen for moisture and healthy appearance
- Style can be worn down, pinned up, or pulled into a puff

### Ideal For
All face shapes, especially round and heart. A versatile, low-manipulation style that protects natural hair while looking effortlessly chic. Perfect for women who want beautiful, defined texture with minimal daily styling.`,
    attributes: {
      hairType: 'twisted',
      hairTexture: '4A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'twist-out',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 4 — Locs (female) — currently 7
  {
    name: 'Graceful Flowing Locs with Natural Poise',
    category: 'Locs',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/5417794/pexels-photo-5417794.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 58,
    ai_description: `### Title: Graceful Flowing Locs with Natural Poise

### Overview
Stunning, well-maintained medium-to-long locs that cascade naturally past the shoulders. The locs are mature, uniform in thickness, and exhibit a healthy, polished appearance with smooth surfaces and neatly retwisted roots. The portrait captures the inherent elegance and grace of the loc journey — a testament to patience, care, and natural beauty. The locs frame the face beautifully and move with fluid, organic grace.

### Styling Details
- Mature locs at chest-length, approximately 14-18 inches
- Medium thickness with consistent sizing throughout
- Roots freshly retwisted for a clean, maintained appearance
- Natural black color with subtle warm undertones
- Worn loose and flowing with natural center parting
- Regular moisturizing and palm-rolling maintenance routine
- Healthy sheen from consistent oil and water regimen

### Ideal For
All face shapes. A timeless, regal style for women committed to the loc journey. The flowing length offers versatility — can be styled up, down, wrapped, or accessorized. Projects strength, confidence, and cultural pride.`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'palm-roll',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // 5 — Afros (female) — currently 7
  {
    name: 'Sculpted Side-Profile Afro with Golden Glow',
    category: 'Afros',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/14001839/pexels-photo-14001839.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 56,
    ai_description: `### Title: Sculpted Side-Profile Afro with Golden Glow

### Overview
A beautifully shaped, voluminous natural afro captured in profile view against a warm brown background. The hair forms a perfectly rounded dome silhouette with well-defined coils that catch the golden-hour light beautifully. The side-profile perspective showcases the incredible volume, shape, and density of the afro — a celebration of natural Black hair in its full, unmanipulated glory.

### Styling Details
- Full natural afro at 5-7 inches, shaped into a rounded silhouette
- Coils picked out with an afro pick for maximum volume and symmetry
- Natural 4B/4C texture with tight, defined coil pattern visible
- No chemical treatment — fully natural, heat-free styling
- Moisturized with leave-in conditioner and sealed with natural oils
- Edges blended naturally into the overall shape
- Regular trimming to maintain the even, sculpted dome shape

### Ideal For
Square, oblong, and angular face shapes — the round shape beautifully softens sharp features. A powerful, confident style that makes a statement of self-love and cultural pride. Perfect for women who embrace their natural texture in its most authentic, voluminous form.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4C',
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

  // 6 — Fades (female) — currently 7
  {
    name: 'Elegant Tapered Pixie with Studio Drama',
    category: 'Fades',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/29852852/pexels-photo-29852852.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 52,
    ai_description: `### Title: Elegant Tapered Pixie with Studio Drama

### Overview
A bold, sophisticated tapered pixie cut captured in dramatic studio lighting against a pure black background. The hair is cropped close on the sides with a clean taper that blends seamlessly into slightly longer texture on top. The minimal length showcases the beautiful head shape and bone structure while the dramatic lighting creates an editorial, high-fashion aesthetic. This is short hair elevated to art.

### Styling Details
- Tapered pixie with sides at #1-2 guard, graduating to 1-2 inches on top
- Clean, blended taper from nape to crown
- Top textured with natural coily pattern left defined
- Edges clean-cut along the hairline and around the ears
- No hard lines — soft, feminine fade transition
- Light hold mousse or cream to define top texture
- Minimal product for a natural, touchable finish

### Ideal For
Oval, heart, and diamond face shapes. A liberating, confident style for women who want to showcase their features and bone structure. The dramatic studio aesthetic proves this cut is high-fashion worthy, while being incredibly low-maintenance day-to-day.`,
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

  // 7 — Weaves (male) — currently 6
  {
    name: 'Textured Braided Weave with Sharp Profile',
    category: 'Weaves',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/31112971/pexels-photo-31112971.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 45,
    ai_description: `### Title: Textured Braided Weave with Sharp Profile

### Overview
A sleek, modern men's braided weave captured in a dramatic side-profile against a dark background. The braids are medium-sized and flow from front to back in clean, defined rows. The striped shirt pairing gives the look a polished, put-together feel. This style demonstrates how a well-installed braided weave can create a sharp, sculpted silhouette that's both protective and fashionable.

### Styling Details
- Feed-in braided weave with medium-sized rows flowing straight back
- Clean, precise parting lines between each row
- Braids sit flat against the head for a sleek profile
- Edges sharp and well-defined at the temple and nape
- Weave installed with minimal tension for scalp health
- Style can last 3-5 weeks with proper night care and edge control
- Light oil applied to scalp between rows for moisture

### Ideal For
All face shapes, particularly long and oval. A polished protective style that works in professional and creative settings alike. The side-profile silhouette is clean and masculine — ideal for men who want a styled look without daily maintenance.`,
    attributes: {
      hairType: 'woven',
      hairTexture: '4B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'sew-in',
      volumeProfile: 'flat',
      partingPattern: 'geometric',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 8 — Coils (female) — currently 9
  {
    name: 'Defined Coil Crown with Contemplative Grace',
    category: 'Coils',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/9928018/pexels-photo-9928018.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 57,
    ai_description: `### Title: Defined Coil Crown with Contemplative Grace

### Overview
A stunning studio portrait showcasing beautifully defined, voluminous coils in their natural glory. The hair forms a magnificent crown of tight, springy coils that radiate outward with impressive volume and definition. Each coil is individually defined yet blends into a cohesive, cloud-like silhouette. The contemplative expression and studio lighting elevate this natural style to fine art — proof that coily hair is inherently majestic.

### Styling Details
- Defined coils at 4-6 inches stretched, creating impressive volume
- Wash-and-go technique with curl-defining cream and gel for hold
- Shingling method applied to each section for maximum definition
- Natural 4A/4B texture with visible coil pattern throughout
- No heat styling — air-dried or diffused on low heat
- Light oil sheen for healthy appearance and moisture retention
- Edges smoothed with edge control for a polished frame

### Ideal For
All face shapes. The volume and structure of defined coils is universally flattering and creates a regal, confident aesthetic. Perfect for women who want to celebrate their natural curl pattern with maximum definition and minimal manipulation.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'finger-coils',
      volumeProfile: 'very-high',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 9 — Traditional (male) — currently 10
  {
    name: 'Beaded Cornrow Cultural Portrait',
    category: 'Traditional',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/15787297/pexels-photo-15787297.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 50,
    ai_description: `### Title: Beaded Cornrow Cultural Portrait

### Overview
A striking cultural hairstyle featuring cornrows adorned with decorative beads, captured in a stylish side portrait. The braids are neatly cornrowed in a traditional pattern with wooden and metallic beads threaded along the length of each braid. This style bridges traditional African hair artistry with contemporary fashion sensibility — a visual celebration of heritage and modern self-expression combined in one powerful look.

### Styling Details
- Medium cornrows in a traditional pattern with decorative beads
- Beads threaded along braid lengths for cultural embellishment
- Braids extend past the ears to shoulder-length
- Clean partings with geometric precision
- Scalp well-moisturized between rows
- Beads secured with thread wrapping at each bead point
- Style honors traditional West African braiding heritage
- Can last 3-6 weeks with careful maintenance

### Ideal For
All face shapes. A bold cultural statement that honors African braiding traditions while feeling contemporary and fashion-forward. Perfect for men who want to express cultural pride through their grooming. Ideal for cultural events, creative spaces, and everyday wear.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'cornrow',
      volumeProfile: 'flat',
      partingPattern: 'geometric',
      complexity: 'highly-intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 10 — Low Cut (female) — currently 9
  {
    name: 'Contemplative Close Crop with Statement Necklace',
    category: 'Low Cut',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/17300247/pexels-photo-17300247.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 54,
    ai_description: `### Title: Contemplative Close Crop with Statement Necklace

### Overview
A refined, elegant close crop on a woman, paired with a bold statement necklace that draws attention to the beautiful neckline revealed by the short style. The hair is cut uniformly close to the scalp, showcasing natural texture and the lovely shape of the head. The contemplative pose and hand-on-chin gesture create an image of thoughtful sophistication — proving that less hair means more impact.

### Styling Details
- Uniform close crop at approximately 0.25-0.5 inches all around
- Natural coily texture visible even at short length
- No fade or taper — consistent length throughout
- Clean edges along the hairline, temple, and nape
- Natural hairline shape maintained
- Minimal product — light oil for scalp health and sheen
- Statement jewelry used to complement the minimalist hair

### Ideal For
Oval, heart, and diamond face shapes. A bold, liberating style that showcases facial features and bone structure. The statement necklace pairing demonstrates how accessories become the focal point with short hair. Perfect for confident women who value simplicity and elegance.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4C',
      length: 'buzz',
      fadeType: 'none',
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
