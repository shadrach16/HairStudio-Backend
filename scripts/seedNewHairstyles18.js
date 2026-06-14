/**
 * Batch 18 Seed Script — 10 new NON-AFRICAN hairstyles
 * DB before: ~259 total | Target after: ~269
 *
 * All non-African styles with diverse categories:
 *   Straight (m) x2  |  Bob (f) x2      |  Fades (m) x2
 *   Modern (f) x2    |  Fashion (m) x1  |  Straight (f) x1
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
  // 1 — Straight (male) — South Asian man with textured quiff + beard
  {
    name: 'Textured Side-Swept Quiff with Groomed Beard',
    category: 'Straight',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/1485994/pexels-photo-1485994.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 65,
    ai_description: `### Title: Textured Side-Swept Quiff with Groomed Beard

### Overview
A sharp, well-groomed textured quiff worn by a South Asian man with a neatly trimmed full beard. The hair is swept to one side with volume at the front, creating a classic yet modern silhouette. The dark hair is thick and healthy with natural movement, styled with a matte finish for an effortlessly polished look.

### Styling Details
- Thick straight hair swept to the right with volume at the crown
- Approximately 3-4 inches on top, tapered shorter on sides
- Styled with a medium-hold matte pomade for texture and lift
- Natural dark brown/black color with no chemical treatment
- Paired with a well-groomed full beard for masculine definition
- Blow-dried upward at the roots for added volume

### Ideal For
Oval, round, and heart face shapes. A universally flattering style that works in both professional and casual settings. The quiff adds height to the face while the side sweep creates a refined, put-together appearance.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C',
      length: 'short',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'blow-out',
      volumeProfile: 'high',
      partingPattern: 'side-right',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 2 — Modern (female) — Blonde pixie cut, clean studio shot
  {
    name: 'Chic Blonde Pixie Cut with Textured Layers',
    category: 'Modern',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/590479/pexels-photo-590479.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 68,
    ai_description: `### Title: Chic Blonde Pixie Cut with Textured Layers

### Overview
A beautifully styled short blonde pixie cut with choppy, textured layers that frame the face elegantly. The platinum-to-golden blonde tones add dimension and warmth, while the short length highlights the cheekbones and jawline. Shot in a clean studio setting, this look is modern, feminine, and full of confidence.

### Styling Details
- Short pixie cut with longer textured layers on top (1-2 inches)
- Sides and back cropped close, blending into the longer crown
- Platinum blonde base with warm golden lowlights for depth
- Styled with texturizing spray for a piecey, lived-in finish
- Side-swept fringe that grazes the forehead
- Minimal product needed — air-dry friendly

### Ideal For
Oval, heart, and diamond face shapes. A bold yet feminine choice for women who love low-maintenance styles with maximum impact. Perfect for creative professionals and anyone wanting a fresh, youthful look that's easy to style daily.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'low',
      partingPattern: 'side-left',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'platinum-blonde',
      hasColorTreatment: true,
      colorNotes: 'Platinum blonde with warm golden lowlights',
      promptFamily: 'standard',
    },
  },

  // 3 — Fades (male) — European man, textured quiff with mid-fade
  {
    name: 'Voluminous Textured Quiff with Mid Fade',
    category: 'Fades',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/7460149/pexels-photo-7460149.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 72,
    ai_description: `### Title: Voluminous Textured Quiff with Mid Fade

### Overview
A striking textured quiff with dramatic volume on top paired with a clean mid-fade on the sides. The European man's thick dark brown hair is swept upward and slightly back, creating impressive height and movement. The stubble beard adds a rugged contrast to the sharp, sculpted cut. Shot outdoors with urban backdrop, the style looks both editorial and street-ready.

### Styling Details
- Thick hair on top at 4-5 inches, styled into a voluminous quiff
- Clean mid-fade on the sides, blending from skin to full volume
- Textured with sea salt spray and medium-hold clay for a matte finish
- Blow-dried forward and up for maximum lift at the front
- Natural dark brown color with no color treatment
- Light stubble beard shaped to complement the fade line

### Ideal For
Square, oblong, and round face shapes. The height adds length to rounder faces while the fade sharpens the overall look. A versatile cut for men who want a polished yet edgy aesthetic suitable for both boardrooms and weekend outings.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2A',
      length: 'medium',
      fadeType: 'mid-fade',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'blow-out',
      volumeProfile: 'very-high',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 4 — Fades (male) — South Asian pompadour with taper fade
  {
    name: 'Sculpted Pompadour with Sharp Taper Fade',
    category: 'Fades',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/16098668/pexels-photo-16098668.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 70,
    ai_description: `### Title: Sculpted Pompadour with Sharp Taper Fade

### Overview
A masterfully executed modern pompadour shown in clean side profile. The South Asian man's jet-black hair is sculpted into a voluminous pompadour shape with smooth, brushed-back top flowing into a precise taper fade on the sides and back. The sharp temple lineup and clean neckline demonstrate barber-level precision. The overall look is refined, commanding, and timelessly masculine.

### Styling Details
- High-volume pompadour at 4-6 inches on top, brushed back
- Taper fade on sides and back, graduating from skin at the ear
- Sharp temple lineup and defined hairline
- Styled with strong-hold pomade for sleek, controlled finish
- Jet-black natural hair color with high sheen
- Clean-shaven face to maximize attention on the cut

### Ideal For
Round, oval, and wide face shapes. The pompadour elongates the face and the taper fade adds definition. A premium barbershop style that communicates attention to detail and personal grooming excellence.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C',
      length: 'medium',
      fadeType: 'taper',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'blow-out',
      volumeProfile: 'very-high',
      partingPattern: 'none',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 5 — Bob (female) — Sleek blonde bob with red turtleneck
  {
    name: 'Sleek Shoulder-Length Blonde Bob',
    category: 'Bob',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/8542018/pexels-photo-8542018.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 66,
    ai_description: `### Title: Sleek Shoulder-Length Blonde Bob

### Overview
A polished, sleek blonde bob that falls just at the shoulders, worn by a Caucasian woman in a red turtleneck. The hair is perfectly smooth and flat-ironed to a mirror-like finish with subtle inward curl at the ends. The warm blonde color is uniform and sun-kissed, complementing fair skin beautifully. Clean, minimal styling lets the precision of the cut speak for itself.

### Styling Details
- Shoulder-length bob with blunt ends, approximately 12 inches
- Flat-ironed to a sleek, smooth finish with slight inward curl
- Center parting for a symmetrical, balanced look
- Warm golden blonde color, likely salon-colored with toner
- Finished with shine serum for high-gloss effect
- Minimal layering — relies on the blunt cut for impact

### Ideal For
Oval, heart, and angular face shapes. The clean lines soften strong features while the shoulder length frames the neck and collarbones. A timeless, salon-perfect style for women who prefer polished elegance with minimal daily effort.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'flat-iron',
      volumeProfile: 'low',
      partingPattern: 'center',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'golden-blonde',
      hasColorTreatment: true,
      colorNotes: 'Warm golden blonde with salon toner finish',
      promptFamily: 'standard',
    },
  },

  // 6 — Straight (male) — Korean two-block cut
  {
    name: 'Korean Two-Block Cut with Natural Texture',
    category: 'Straight',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/8586504/pexels-photo-8586504.png?cs=srgb&w=1200',
    price: 1,
    popularity: 64,
    ai_description: `### Title: Korean Two-Block Cut with Natural Texture

### Overview
A classic Korean two-block haircut featuring a voluminous, textured top with naturally tousled movement. The East Asian man's black hair is cut shorter on the sides and left longer on top (approximately 4-5 inches), allowing the natural straight texture to create soft, effortless layers. The overall look is youthful, trendy, and perfectly on-trend with K-beauty grooming standards.

### Styling Details
- Two-block cut: shorter sides with long, voluminous top
- Top length approximately 4-5 inches with textured layers
- Natural straight hair texture with slight wave from styling
- Styled with volumizing mousse or light wax for movement
- No hard part — hair falls naturally with a slight side sweep
- Natural black color with no chemical treatment

### Ideal For
Round, square, and wide face shapes. The volume on top elongates the face while the soft layers add dimension. An extremely popular style in East Asian fashion, perfect for men who want a clean, modern look that's easy to maintain with regular trims.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1A',
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
      promptFamily: 'standard',
    },
  },

  // 7 — Bob (female) — Icy platinum blunt bob
  {
    name: 'Icy Platinum Blunt Bob with Center Part',
    category: 'Bob',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/6364028/pexels-photo-6364028.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 71,
    ai_description: `### Title: Icy Platinum Blunt Bob with Center Part

### Overview
A head-turning icy platinum blonde blunt bob that grazes the jawline with razor-sharp precision. The hair is perfectly straight, sleek, and uniform in length from front to back, creating a graphic, editorial silhouette. The center part adds symmetry and the ultra-light platinum color makes this look undeniably bold and high-fashion.

### Styling Details
- Jaw-length blunt bob with zero layering for a clean line
- Precision-cut ends that are perfectly even all around
- Icy platinum blonde achieved through professional bleaching and toning
- Flat-ironed to absolute smoothness with anti-frizz serum
- Clean center part from forehead to crown
- Requires professional maintenance every 4-6 weeks for root touch-ups

### Ideal For
Oval, heart, and long face shapes. The jaw-length cut adds width to narrow faces while the blunt ends create structure. A statement style for fashion-forward women who aren't afraid of high-maintenance color — the payoff is a stunning, magazine-worthy look.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'flat-iron',
      volumeProfile: 'low',
      partingPattern: 'center',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'platinum-blonde',
      hasColorTreatment: true,
      colorNotes: 'Icy platinum blonde with professional bleach and cool-toned toner',
      promptFamily: 'standard',
    },
  },

  // 8 — Straight (female) — Asian woman with copper chin-length lob
  {
    name: 'Warm Copper Chin-Length Lob',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/5301008/pexels-photo-5301008.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 62,
    ai_description: `### Title: Warm Copper Chin-Length Lob

### Overview
A chic chin-length lob (long bob) with warm copper-auburn tones worn by an East Asian woman. The hair is cut to a flattering chin length with subtle face-framing layers that add movement and softness. The warm reddish-copper color catches the light beautifully and adds a vibrant, youthful energy to the overall look.

### Styling Details
- Chin-length lob, approximately 8-10 inches
- Subtle layering around the face for soft, natural movement
- Warm copper/auburn color achieved through semi-permanent dye
- Air-dried or lightly blow-dried for natural, effortless texture
- No parting visible — hair falls naturally forward
- Minimal styling — works beautifully with the hair's natural body

### Ideal For
Round, oval, and square face shapes. The chin-length cut elongates the neck while the warm copper tones add warmth to cooler skin undertones. A low-maintenance, trendy style that's perfect for women wanting a color refresh without going too bold.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'copper-auburn',
      hasColorTreatment: true,
      colorNotes: 'Warm copper-auburn semi-permanent color',
      promptFamily: 'standard',
    },
  },

  // 9 — Fashion (male) — Top knot with sharp undercut
  {
    name: 'Sleek Top Knot with Sharp Undercut',
    category: 'Fashion',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/29570984/pexels-photo-29570984.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 60,
    ai_description: `### Title: Sleek Top Knot with Sharp Undercut

### Overview
A modern, fashion-forward top knot (man bun) paired with a crisp undercut, photographed from behind in a studio setting. The dark hair is gathered into a neat, textured knot at the crown while the sides and back are shaved into a high-contrast undercut that fades from skin up. The overall aesthetic is refined, editorial, and effortlessly cool — elevated by a tailored black blazer.

### Styling Details
- Top section grown to 6-8 inches, gathered into a high top knot
- Undercut on sides and back with a mid-to-high fade transition
- Hair pulled back smoothly with light gel or styling cream
- Natural dark brown/black color, no treatment
- Small gold earring detail adds to the fashion-forward vibe
- Clean neckline and sharp fade line behind the ears

### Ideal For
Round, oval, and square face shapes. The upward height from the top knot elongates the face while the clean sides add sharpness. A sophisticated option for men who want a versatile style — the knot can be worn up for a polished look or let down for a completely different vibe.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'long',
      fadeType: 'high-fade',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 10 — Modern (female) — Long wavy dark curls, studio portrait
  {
    name: 'Flowing Dark Wavy Curls with Studio Elegance',
    category: 'Modern',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/18154302/pexels-photo-18154302.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 67,
    ai_description: `### Title: Flowing Dark Wavy Curls with Studio Elegance

### Overview
Luxurious long, dark wavy curls cascading past the shoulders in a moody studio portrait. The naturally voluminous hair features a mix of loose waves and defined ringlets that create incredible depth and texture. The dark chocolate-brown color is rich and glossy, catching studio light to reveal warm undertones. The overall mood is artistic, feminine, and timeless.

### Styling Details
- Long wavy hair extending to mid-back, approximately 18-22 inches
- Natural curl pattern with a mix of loose waves and ringlet curls
- Deep chocolate-brown color with warm chestnut highlights in the light
- Styled with curl-defining cream and air-dried for natural movement
- Center part allowing curls to frame the face on both sides
- Anti-frizz serum applied for smooth, defined curls without crunchiness

### Ideal For
Square, angular, and oblong face shapes. The voluminous waves soften sharp features while the length adds drama and femininity. An effortlessly glamorous style for women blessed with natural wave or curl patterns who want to embrace their texture with minimal heat styling.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2C',
      length: 'extra-long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'center',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      colorNotes: 'Deep chocolate-brown with natural warm chestnut highlights',
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
  console.error('Fatal:', err);
  process.exit(1);
});
