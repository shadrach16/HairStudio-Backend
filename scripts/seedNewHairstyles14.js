/**
 * Batch 14 Seed Script — 10 new hairstyles (Diverse Gap Fill)
 * DB before: 339 total | Target after: 349
 *
 * Target gaps: Fades/female, Locs/female, Traditional/female,
 * Low Cut/female, Bob/female, Locs/male, Protective/male, Coils/male
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
  // 1 — Fades/female
  {
    name: 'Sleek Short Fade with Confident Night Presence',
    category: 'Fades',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/17908112/pexels-photo-17908112.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 55,
    ai_description: `### Title: Sleek Short Fade with Confident Night Presence

### Overview
A powerful studio portrait of a confident woman with a precision short fade hairstyle, captured against a dramatic black background in London. The hair is cropped very short on the sides with slightly more length on top, creating a sleek, modern silhouette that accentuates the face and bone structure. The dramatic studio lighting creates sharp contrasts that highlight the clean lines of the cut and the subject's self-assured expression.

### Styling Details
- Precision short fade — skin-close at the temples, graduating to 1-2 inches on top
- Clean, sharp fade line transitioning from bare skin to textured top
- Top section styled flat or with minimal product for a sleek finish
- Dark natural hair color with no color treatment
- Clean edges around ears and nape — barber-precision work
- Minimal volume — hair lies close to the head
- Side-parting or no parting depending on styling preference
- Hair texture appears straight to wavy (2A/2B)

### Ideal For
Oval, heart, and diamond face shapes. The fade draws attention upward and highlights cheekbones and eyes. A bold, gender-fluid style that makes a strong statement about confidence and self-expression. Low maintenance — requires a barber visit every 2-3 weeks to maintain the sharp fade line.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'buzz',
      fadeType: 'high-fade',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // 2 — Locs/female
  {
    name: 'Side Profile Locs with Plaid Studio Editorial',
    category: 'Locs',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/19308121/pexels-photo-19308121.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 57,
    ai_description: `### Title: Side Profile Locs with Plaid Studio Editorial

### Overview
An artistic side-profile studio portrait of a woman with beautiful, well-maintained dreadlocks wearing a fashionable checked/plaid shirt. The locs cascade from the crown and drape naturally beside the face, creating a striking silhouette against the neutral studio background. The side-angle composition highlights the cylindrical shape and healthy texture of each individual loc, while the warm studio lighting creates rich tones throughout the hair. The overall aesthetic is editorial yet relatable — fashion-forward with an effortless quality.

### Styling Details
- Medium-to-long mature dreadlocks hanging past the shoulders
- Well-maintained cylindrical shape with smooth surface from regular palm-rolling
- Locs hang freely with natural weight creating elegant draping
- Natural dark brown/black color with subtle warm highlights from studio light
- Medium thickness — consistent sizing throughout
- Clean roots with no excessive buildup or frizz
- No accessories — letting the locs themselves be the focal point
- Some locs fall forward framing the face in profile view

### Ideal For
All face shapes. The side-profile draping creates a feminine, romantic quality while maintaining the strength of natural locs. A versatile everyday style that transitions easily from casual (as shown with the plaid shirt) to formal events. Low daily maintenance for mature locs — just moisturize and go.`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // 3 — Locs/female
  {
    name: 'Elegant Studio Locs with Tattoo Artistry',
    category: 'Locs',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/15248443/pexels-photo-15248443.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 60,
    ai_description: `### Title: Elegant Studio Locs with Tattoo Artistry

### Overview
A stunning studio portrait of an elegant black woman showcasing beautifully maintained dreadlocks complemented by visible arm tattoos. The combination creates a powerful juxtaposition of refined femininity and edgy self-expression. The locs are long, well-groomed, and styled to fall naturally, while the professional studio lighting creates dimension and catches the healthy sheen of each loc. The neutral gray studio background keeps all attention on the subject's hair and confident presence.

### Styling Details
- Long mature dreadlocks extending past the shoulders
- Uniform medium-thickness locs with consistent cylindrical shape
- Smooth, well-maintained surface — evidence of regular palm-rolling and maintenance
- Natural dark black color throughout — no color treatment
- Hair falls naturally on both sides with some locs pulled back
- Clean hairline with no frizz or buildup at the roots
- Pearl earrings or subtle jewelry complementing the natural elegance
- Overall polished, editorial-quality grooming

### Ideal For
All face shapes, especially oval and heart-shaped. Long locs frame the face beautifully and add visual length to rounder features. This style demonstrates how locs can be both natural and utterly elegant — suitable for corporate settings, formal events, and high-fashion contexts. Requires regular maintenance appointments every 4-6 weeks for retwisting and conditioning.`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4B',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // 4 — Traditional/female
  {
    name: 'Regal Natural Updo in Golden Yellow Dress',
    category: 'Traditional',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/37010088/pexels-photo-37010088.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 56,
    ai_description: `### Title: Regal Natural Updo in Golden Yellow Dress

### Overview
A graceful indoor portrait of a woman wearing a stunning yellow dress while showcasing a regal natural hairstyle. The hair is styled into an elegant updo or pulled-back arrangement that highlights the face and elongates the neck, creating a sophisticated, timeless silhouette. The warm tones of the yellow dress complement the rich dark hair perfectly. The overall composition exudes quiet confidence, grace, and African feminine beauty traditions — a modern interpretation of traditional styling that works in both cultural celebrations and contemporary formal settings.

### Styling Details
- Natural hair styled into an elegant pulled-back or updo arrangement
- Hair gathered and lifted away from the face and neck
- Visible natural texture (4A/4B) maintained even in the styled arrangement
- Smooth edges with possible gel or edge control for polished finish
- Height at the crown creating an elongating, regal effect
- Natural dark black color with healthy luster
- Clean, defined hairline framing the face
- Possible incorporation of loc or twist elements in the updo structure

### Ideal For
All face shapes, particularly round and square. The updo creates vertical lines that elongate and slim the face while exposing the elegant neckline. A classic African styling tradition updated for modern formal wear — perfect for weddings, galas, church events, and cultural celebrations. Can be achieved with natural hair, locs, or twists as the base.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 5 — Low Cut/female
  {
    name: 'Edgy Pierced Buzz with Bold Street Attitude',
    category: 'Low Cut',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/7952187/pexels-photo-7952187.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 48,
    ai_description: `### Title: Edgy Pierced Buzz with Bold Street Attitude

### Overview
A striking portrait of a woman with an ultra-short buzz cut paired with facial piercings and a black outfit, creating an unapologetically bold, punk-inspired aesthetic. The hair is cropped extremely close to the scalp — barely 1/4 inch — showcasing the natural shape of the head and putting all focus on the face, piercings, and expression. The dark outfit and moody lighting complement the minimalist hair, creating a cohesive look that communicates confidence, individuality, and creative rebellion.

### Styling Details
- Ultra-short buzz cut — approximately #1 or #2 guard all over
- Uniform length with no visible parting or styling variation
- Clean, even clipper work with no patches or uneven areas
- Natural dark hair color — no bleaching or dye
- Hair lies completely flat against the scalp
- No fade variation — consistent buzz length throughout
- Clean edges at hairline, temples, and nape
- Facial piercings (nose, possibly septum) complementing the minimalist hair

### Ideal For
Oval and oblong face shapes. A bold choice that puts facial features front and center — highlighting eyes, bone structure, and jawline. The ultimate low-maintenance style — wash and go with zero daily styling time. Perfect for women who want to make a strong statement about self-expression and reject conventional beauty norms. Grows into a TWA naturally over 4-8 weeks.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'buzz',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // 6 — Bob/female
  {
    name: 'Trendy Cropped Bob with Silk Scarf Accent',
    category: 'Bob',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/5928643/pexels-photo-5928643.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 53,
    ai_description: `### Title: Trendy Cropped Bob with Silk Scarf Accent

### Overview
A contemplative profile portrait of a woman with a trendy cropped bob hairstyle, elevated by a delicate silk scarf accessory. Captured from the side in soft natural lighting, the image showcases the precision of the bob cut — how it follows the jawline perfectly and creates a clean, geometric shape. The hair sits at chin-length with a blunt cut bottom edge that gives the style its modern sharpness. The silk scarf adds a touch of vintage elegance to an otherwise contemporary look.

### Styling Details
- Chin-length bob with blunt-cut edges for a sharp, modern finish
- Hair appears straight to slightly wavy (2A texture)
- Side-parted with hair falling naturally along the jawline
- Dark natural color — rich brunette/black
- Smooth, sleek finish suggesting blow-dry or flat-iron styling
- Blunt ends create visual weight and structure at jaw level
- Light silk scarf wrapped as a headband for accessory interest
- Volume concentrated at mid-lengths for natural movement

### Ideal For
Oval, heart, and diamond face shapes. The chin-length bob frames the jawline and creates balance with wider foreheads. A classic, universally flattering style that looks polished with minimal effort. Requires trims every 6-8 weeks to maintain the sharp blunt edge. Versatile — can be worn sleek, with waves, or accessorized as shown.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'blow-out',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 7 — Locs/male
  {
    name: 'Free-Hanging Locs Under Clear Blue Sky',
    category: 'Locs',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/34111583/pexels-photo-34111583.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 54,
    ai_description: `### Title: Free-Hanging Locs Under Clear Blue Sky

### Overview
A vibrant outdoor portrait of a young man with free-hanging dreadlocks captured under a clear blue sky. The natural sunlight illuminates the locs beautifully, revealing their rich texture and healthy sheen. The subject looks upward or forward with confidence, the bright sky creating a clean, optimistic backdrop that contrasts with the dark hair. The outdoor setting gives the portrait a fresh, energetic quality that celebrates natural hair and outdoor freedom.

### Styling Details
- Medium-length dreadlocks hanging freely past the ears
- Natural black color with warm sun-kissed highlights on the surface
- Locs appear to be in a semi-mature stage — formed but still developing character
- Medium thickness with natural variation between individual locs
- Hair falls naturally without any ties, bands, or accessories
- Clean scalp visible at the roots showing healthy growth
- Some locs pointing upward or outward from natural volume
- Overall free, unstructured arrangement celebrating natural movement

### Ideal For
All face shapes. Free-hanging locs at this medium length create a youthful, carefree aesthetic that works for everyday casual wear. The style requires patience during the locking phase (6-12 months) but becomes increasingly low-maintenance over time. Perfect for men who want a natural style that grows more distinguished with age.`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4A',
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
      promptFamily: 'locs',
    },
  },

  // 8 — Locs/male
  {
    name: 'Sun-Warmed Locs with Nostril Ring Portrait',
    category: 'Locs',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/17345182/pexels-photo-17345182.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 56,
    ai_description: `### Title: Sun-Warmed Locs with Nostril Ring Portrait

### Overview
A warm, intimate outdoor portrait of a stylish man with well-maintained dreadlocks and a nostril piercing, bathed in golden warm sunlight. The sunlight creates a beautiful rim-light effect on the locs, highlighting their cylindrical texture and the golden-brown tones that develop with sun exposure. The nose piercing adds a subtle edgy detail that complements the natural, organic quality of the locs. The overall mood is relaxed, authentic, and approachable — a man comfortable in his skin and his style.

### Styling Details
- Medium-length mature dreadlocks with sun-lightened brown tones
- Well-maintained cylindrical shape with some natural irregularity
- Locs hang freely, some falling forward to frame the face
- Warm golden-brown highlights from natural sun exposure (no dye)
- Medium thickness locs — approximately pencil-width
- Nose ring (nostril) as a complementary style accent
- Clean, groomed facial hair visible
- Roots show healthy new growth being incorporated

### Ideal For
All face shapes. The warm-toned locs soften angular features and frame the face naturally. A relaxed, artistic look popular among musicians, creatives, and anyone who values natural self-expression. The sun-lightened tones add depth and visual interest without requiring chemical treatment. Low maintenance once established — monthly palm-rolling and moisturizing.`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'brown',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // 9 — Protective/male
  {
    name: 'Street Style Locs with Headband Wrap',
    category: 'Protective',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/4031041/pexels-photo-4031041.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 51,
    ai_description: `### Title: Street Style Locs with Headband Wrap

### Overview
A confident street-style portrait of a young African American man with dreadlocks worn with a fashionable headband/wrap, standing against an urban backdrop. The headband serves both a functional and stylistic purpose — keeping the locs pulled back from the face while adding a bold fashion statement. The subject wears a warm outfit suggesting a casual, comfortable street-style aesthetic. The doorway framing creates a natural compositional focus on the subject and his distinctive hair styling.

### Styling Details
- Medium-to-long dreadlocks pulled back with a fabric headband
- Headband wraps around the forehead pushing locs backward
- Locs visible above and behind the headband creating volume at the crown
- Natural dark black color throughout
- Headband acts as a protective styling element — securing hair in place
- Beard growth complements the natural, lived-in aesthetic
- Some locs may be gathered or loosely tied behind
- Clean, well-maintained locs despite the casual styling approach

### Ideal For
All face shapes. The headband creates a clean forehead line while the volume above adds height. A practical protective style for active days — gym, errands, casual outings — that still looks intentional and stylish. The headband technique works for any loc length and protects edges from friction. Easy to switch accessories for different looks without restyling.`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // 10 — Coils/male
  {
    name: 'Joyful Natural Coils with Urban Wall Backdrop',
    category: 'Coils',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/6237911/pexels-photo-6237911.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 52,
    ai_description: `### Title: Joyful Natural Coils with Urban Wall Backdrop

### Overview
A warm, joyful portrait of a delighted young African American man with natural coiled hair, leaning against a concrete wall and smiling broadly. The short-to-medium length coils are grown out into a well-shaped natural style that frames the face with softness and texture. The genuine smile and relaxed posture create an approachable, positive energy that celebrates natural Black hair in its unmanipulated glory. Natural daylight highlights the coil pattern and the healthy sheen of properly moisturized natural hair.

### Styling Details
- Short-to-medium natural coils approximately 2-3 inches from scalp
- Defined 4A/4B coil pattern growing upward and outward
- Hair shaped into a soft, rounded natural silhouette
- Moisturized with visible healthy sheen — likely from leave-in conditioner
- No visible parting — hair grows uniformly from all angles
- Well-maintained shape — trimmed to avoid uneven patches
- Natural dark black color with no treatment
- Casual, effortless styling — wash-and-go aesthetic

### Ideal For
Oval, diamond, and heart face shapes. A classic natural men's style that celebrates coily texture in its purest form. Extremely low maintenance — just moisturize daily and shape at the barber every 4-6 weeks. The rounded silhouette adds softness to angular features and creates a friendly, approachable appearance. Perfect for any setting from casual to professional.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
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
  process.exit(0);
}

seed().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
