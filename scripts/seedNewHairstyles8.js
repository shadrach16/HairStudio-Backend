/**
 * Batch 8 Seed Script — 10 new hairstyles
 * DB before: ~119 total | Target after: ~129
 *
 * Category targets (filling under-represented + adding variety):
 *   Fashion (m)  0→1   |  Bob (f) +1    |  Traditional (f) +1
 *   Twists (m) +1      |  Straight (f) +1  |  Protective (f) +1
 *   Fades (m) +1       |  Braids (f) +1 |  Locs (f) +1
 *   Low Cut (m) +1
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
  // 1 — Fashion (male) — currently 0 male Fashion styles
  {
    name: 'Trendy Side-Profile Fade with Dyed Top',
    category: 'Fashion',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/17086220/pexels-photo-17086220.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 52,
    ai_description: `### Title: Trendy Side-Profile Fade with Dyed Top

### Overview
A bold fashion-forward men's cut featuring a sharp mid-fade on the sides with a dramatically longer, dyed top section swept to one side. The contrasting color (bleached/platinum tips against dark roots) and the asymmetric volume make this an editorial-level statement cut.

### Styling Details
- Mid-fade on sides and back, crisp lineup at the temple
- Top is 4-6 inches, blow-dried with volume and swept to the right
- Platinum or blonde color treatment on the top section only
- Finished with light-hold styling cream for texture and movement

### Ideal For
Angular to oval face shapes. Best suited for confident men who want a head-turning, magazine-ready look that blends street style with high fashion.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '3C',
      length: 'medium',
      fadeType: 'mid-fade',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'blow-out',
      volumeProfile: 'high',
      partingPattern: 'side-right',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: true,
      colorNotes: 'Platinum/blonde dye on top section only, dark roots visible',
      promptFamily: 'standard',
    },
  },

  // 2 — Bob (female) — adding variety
  {
    name: 'Sleek Chin-Length Bob',
    category: 'Bob',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/15122858/pexels-photo-15122858.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 60,
    ai_description: `### Title: Sleek Chin-Length Bob

### Overview
A classic, beautifully executed chin-length bob worn straight and sleek. The hair is parted slightly off-center and falls in a uniform curtain to just below the jawline. The ends are blunt-cut for a clean, sharp silhouette that frames the face elegantly.

### Styling Details
- Chin-length blunt cut, even all around
- Slight off-center part for subtle asymmetry
- Flat-ironed smooth with high-shine finishing serum
- No layers — relies on the precision of the cut for shape
- Natural black color with healthy sheen

### Ideal For
All face shapes, particularly heart and oval. A timeless, professional look that transitions effortlessly from boardroom to evening out. Low maintenance once cut.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'flat-iron',
      volumeProfile: 'low',
      partingPattern: 'side-left',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 3 — Traditional (female) — adding variety
  {
    name: 'Elegant African Threaded Updo',
    category: 'Traditional',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/17463802/pexels-photo-17463802.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 45,
    ai_description: `### Title: Elegant African Threaded Updo

### Overview
A stunning traditional African hairstyle featuring intricate thread-wrapped sections sculpted into an elevated updo. Black threading wraps tightly around grouped hair sections, creating geometric, elongated cones that rise from the scalp. This is a celebration of African heritage and artistry.

### Styling Details
- Natural hair sectioned into 8-12 segments
- Each section tightly wrapped with black cotton thread from root to tip
- Sections arranged upward and fanned outward for sculptural volume
- No heat required — entirely thread-manipulated
- Clean edges and nape for a polished finish

### Ideal For
All face shapes. A cultural statement piece perfect for events, celebrations, or anyone wanting to honor African hair traditions with a regal, architectural silhouette.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'other',
      volumeProfile: 'high',
      partingPattern: 'geometric',
      complexity: 'highly-intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'protective-install',
    },
  },

  // 4 — Twists (male)
  {
    name: 'Defined Two-Strand Twists with Fade',
    category: 'Twists',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/6616646/pexels-photo-6616646.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 58,
    ai_description: `### Title: Defined Two-Strand Twists with Fade

### Overview
A clean, masculine look featuring well-defined two-strand twists on top with a sharp fade on the sides. The twists are medium-length, uniform in size, and styled to fall naturally. The combination of textured top and clean-faded sides creates a strong, put-together silhouette.

### Styling Details
- Two-strand twists on top, approximately 3-5 inches long
- Low to mid-fade on the sides and back
- Twists parted naturally, no rigid pattern
- Light oil or twist cream applied for definition and moisture
- Clean neckline taper

### Ideal For
Oval, square, and diamond face shapes. An excellent everyday style for men who want texture and personality without excessive maintenance. Looks great fresh or after a few weeks of growth.`,
    attributes: {
      hairType: 'twisted',
      hairTexture: '4A',
      length: 'medium',
      fadeType: 'low-fade',
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

  // 5 — Straight (female)
  {
    name: 'Flowing Straight Layered Look',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/2616962/pexels-photo-2616962.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 55,
    ai_description: `### Title: Flowing Straight Layered Look

### Overview
A gorgeous, flowing straight hairstyle with soft layers that add movement and body. The hair cascades past the shoulders with a natural center part, creating a balanced and feminine frame around the face. The finish is silky smooth with subtle volume at the roots.

### Styling Details
- Long, layered straight hair extending past shoulders
- Center parting for a balanced, symmetrical look
- Flat-ironed or blow-dried straight with round brush
- Face-framing layers starting at chin level
- Finished with shine spray for a glossy, healthy appearance

### Ideal For
Round, heart, and oval face shapes. A versatile, classic style that works for everyday wear, professional settings, and special occasions. Easily dressed up with accessories.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'flat-iron',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 6 — Protective (female)
  {
    name: 'Bantu Knots Crown',
    category: 'Protective',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/30878878/pexels-photo-30878878.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 48,
    ai_description: `### Title: Bantu Knots Crown

### Overview
A beautiful arrangement of Bantu knots covering the entire head in a symmetrical, crown-like pattern. Each knot is tightly coiled and sits neatly on the scalp, creating a stunning geometric pattern. This protective style is both artistic and functional, preserving hair health while making a bold fashion statement.

### Styling Details
- 15-20 evenly spaced Bantu knots across the entire head
- Hair sectioned into clean squares or triangular parts
- Each section twisted tightly and wrapped into a flat knot
- Secured with bobby pins or natural tension
- Edges laid smooth with edge control gel
- Clean, defined parts between each knot

### Ideal For
All face shapes. A striking protective style that celebrates natural texture and African heritage. Perfect for festivals, creative events, or as a multi-day protective style that can later be unraveled into a gorgeous Bantu knot-out.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4C',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'other',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'protective-install',
    },
  },

  // 7 — Fades (male)
  {
    name: 'Clean Mid-Fade with Textured Afro Top',
    category: 'Fades',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/6616677/pexels-photo-6616677.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 62,
    ai_description: `### Title: Clean Mid-Fade with Textured Afro Top

### Overview
A well-groomed men's cut featuring a precise mid-fade on the sides that transitions seamlessly into a full, textured afro top. The top retains its natural coily texture with defined volume, while the faded sides keep the look sharp and modern. Classic eyeglasses complement the intellectual, polished vibe.

### Styling Details
- Mid-fade starting just above the ear line
- Natural afro texture on top, approximately 3-4 inches
- Defined coils maintained with curl cream and pick
- Clean temple lineup and sharp neckline
- No hard part — natural volume distribution

### Ideal For
Round and oval face shapes. An excellent choice for men who want to showcase their natural texture while keeping a clean, professional edge. Works great in both casual and corporate settings.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B',
      length: 'short',
      fadeType: 'mid-fade',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // 8 — Braids (female)
  {
    name: 'Long Goddess Braids with Beige Highlights',
    category: 'Braids',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/7624555/pexels-photo-7624555.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 65,
    ai_description: `### Title: Long Goddess Braids with Beige Highlights

### Overview
Stunning waist-length goddess braids featuring a blend of dark brown and warm beige/blonde highlights woven throughout. The braids are medium-thickness, flowing freely over the shoulders and down the back. Loose, wavy tendrils escape at intervals along each braid, giving the signature goddess braid texture.

### Styling Details
- Medium box-parted goddess braids, approximately 20-24 inches
- Dark brown base with beige/honey blonde extension hair blended in
- Loose curly strands wrapped around each braid at regular intervals
- Braids flow freely — no updo or pinning
- Clean parts with light edge control
- Finished with mousse for hold on the wavy tendrils

### Ideal For
All face shapes. A gorgeous, versatile protective style that can last 4-8 weeks. The highlight dimension adds warmth and visual interest, making this perfect for warm-weather seasons and special occasions.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A',
      length: 'extra-long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'box-braid',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: true,
      colorNotes: 'Beige/honey blonde highlights blended with dark brown braiding hair',
      promptFamily: 'braids-twists',
    },
  },

  // 9 — Locs (female)
  {
    name: 'Warm-Toned Faux Locs with Smile',
    category: 'Locs',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/4355347/pexels-photo-4355347.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 56,
    ai_description: `### Title: Warm-Toned Faux Locs with Smile

### Overview
Beautiful medium-length faux locs in a warm brown-to-caramel gradient that frames the face elegantly. The locs are medium-thickness, falling just past the shoulders, with a natural-looking wrapped texture. The style exudes warmth, confidence, and effortless beauty.

### Styling Details
- Medium faux locs, 14-18 inches in length
- Warm brown base transitioning to caramel/honey tips
- Wrapped with Marley or synthetic loc hair for authentic texture
- Parted to one side with volume at the crown
- Loose, flowing arrangement — not tied up
- Light oil applied for sheen

### Ideal For
Oval, heart, and square face shapes. A beautiful protective style that mimics the look of mature locs without the commitment. The warm color palette complements medium to deep skin tones beautifully. Lasts 6-8 weeks.`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'faux-loc',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: true,
      colorNotes: 'Warm brown to caramel/honey ombre gradient',
      promptFamily: 'locs',
    },
  },

  // 10 — Low Cut (male)
  {
    name: 'Sharp Low Cut with Beard Blend',
    category: 'Low Cut',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/6390060/pexels-photo-6390060.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 58,
    ai_description: `### Title: Sharp Low Cut with Beard Blend

### Overview
A clean, masculine low cut that seamlessly blends into a well-groomed beard. The hair is kept uniformly short on top (about a #2-3 guard) with a subtle taper on the sides that connects naturally into the beard line. The overall look is sharp, mature, and effortlessly cool.

### Styling Details
- Uniform low cut on top, approximately 1/4 to 3/8 inch
- Subtle taper on the sides blending into the beard
- Clean temple lineup and defined edge-up
- Beard trimmed and shaped to complement the cut
- Natural hairline maintained — no hard lines
- Light moisturizer for healthy scalp sheen

### Ideal For
All face shapes, especially round and square. The beard blend adds definition to the jawline. A low-maintenance, universally flattering style that always looks fresh. Perfect for professionals and anyone who prefers a clean, no-fuss look.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B',
      length: 'buzz',
      fadeType: 'taper',
      hasLineup: true,
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

  const total = await Hairstyle.countDocuments();
  console.log(`\n🎉 Done! Created ${created}, Skipped ${skipped}. Total hairstyles: ${total}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
