/**
 * Batch 15 Seed Script — 10 new hairstyles (Male Gap Fill)
 * DB before: 349 total | Target after: 359
 *
 * Target gaps: Bob/male(6), Afros/male(7), Coils/male(7),
 * Braids/male(8), Twists/male(8), Weaves/male(8)
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
  // 1 — Afros/male
  {
    name: 'Bold Natural Afro with Defined Silhouette',
    category: 'Afros',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 52,
    ai_description: `### Title: Bold Natural Afro with Defined Silhouette

### Overview
A striking portrait of a man with a bold, full natural afro hairstyle. The hair grows outward in all directions creating a perfectly rounded silhouette that frames the face symmetrically. The coily texture is celebrated in its natural state — no chemical treatment, no manipulation — just pure, healthy 4C hair grown out to its full glory. The portrait captures the confidence and cultural pride that comes with wearing a natural afro, with lighting that highlights the texture and volume of each coil.

### Styling Details
- Full, rounded natural afro approximately 4-6 inches from the scalp
- Even growth in all directions creating a symmetrical globe shape
- Dense 4B/4C coil pattern with tight, springy curls
- Natural dark black color with no dye or treatment
- Hair picked out for maximum volume and uniform shape
- Clean, even shape suggesting regular trimming for maintenance
- No visible parting — hair grows uniformly from scalp
- Natural matte finish with subtle sheen from moisturizing

### Ideal For
Round, oval, and heart face shapes. The full afro adds width and height proportionally, making it universally flattering. A powerful statement of identity and cultural pride. Maintenance involves daily moisturizing with leave-in conditioner, regular picking/fluffing for shape, and periodic trims to maintain the rounded silhouette.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4C',
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
      promptFamily: 'natural-textured',
    },
  },

  // 2 — Braids/male
  {
    name: 'Neat Cornrow Braids with Clean Scalp Lines',
    category: 'Braids',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 58,
    ai_description: `### Title: Neat Cornrow Braids with Clean Scalp Lines

### Overview
A clean, well-composed portrait of a man with neatly braided cornrow hairstyle. The braids are executed with precision — each row runs straight back from the hairline with consistent spacing, creating geometric parallel lines across the scalp. The technique demonstrates skilled braiding with uniform tension and even sizing throughout. The overall effect is polished, masculine, and intentionally structured — a style that works equally well in professional and creative settings.

### Styling Details
- Straight-back cornrow braids running from front hairline to nape
- 6-8 evenly spaced rows with clean, visible scalp partings
- Consistent braid thickness from root to tip
- Hair gathered and braided tightly against the scalp
- Natural dark black color with no extensions
- Clean, sharp hairline visible at the front
- Braids terminate at the nape or are tucked/secured
- Fresh braids with no frizz — recently done or well-maintained

### Ideal For
All face shapes. Cornrows are versatile and practical — they protect the hair while creating a sharp, intentional look. The straight-back pattern elongates the face and creates clean vertical lines. Maintenance involves wrapping at night, moisturizing the scalp, and re-braiding every 2-4 weeks.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'none',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'cornrow',
      volumeProfile: 'low',
      partingPattern: 'geometric',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 3 — Twists/male
  {
    name: 'Defined Two-Strand Twists with Natural Fall',
    category: 'Twists',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/5384440/pexels-photo-5384440.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 55,
    ai_description: `### Title: Defined Two-Strand Twists with Natural Fall

### Overview
A well-composed portrait showcasing a man with defined two-strand twists that hang naturally. The twists are medium-length, extending past the ears and creating a textured, dimensional look. Each twist is uniform in size and tension, demonstrating skilled technique. The natural fall of the twists creates movement and frames the face softly. This is a protective style that celebrates natural texture while offering versatility.

### Styling Details
- Two-strand twists approximately 4-6 inches in length
- Medium thickness — each twist incorporates a consistent amount of hair
- Natural dark brown/black color with no extensions
- Twists hang freely with natural weight and movement
- Visible natural texture at the roots suggesting 4A/4B hair type
- Even sizing and spacing throughout the head
- Some twists fall forward to frame the face
- Clean, groomed appearance with no excessive frizz

### Ideal For
All face shapes. Two-strand twists are one of the most versatile protective styles for men — they work in casual, professional, and creative environments. The style protects hair from manipulation and environmental damage while maintaining a polished appearance. Can be maintained for 2-4 weeks before retwisting.`,
    attributes: {
      hairType: 'twisted',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'other',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 4 — Coils/male
  {
    name: 'Defined Natural Curls with Gold Earring Accent',
    category: 'Coils',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/8711032/pexels-photo-8711032.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 50,
    ai_description: `### Title: Defined Natural Curls with Gold Earring Accent

### Overview
An intimate portrait of a young man with beautifully defined natural curly hair, accented by a gold earring. The curls are tight and springy — 3C to 4A pattern — growing upward and outward from the scalp with excellent definition. The gold earring catches the light and adds a fashionable edge to the otherwise natural styling. The combination of natural hair texture and intentional jewelry creates a look that's both organic and fashion-conscious.

### Styling Details
- Short-to-medium natural curls approximately 2-4 inches
- Well-defined 3C/4A curl pattern with visible coil structure
- Hair appears moisturized with good sheen — likely using curl cream or gel
- Natural dark black color throughout
- Curls have consistent definition suggesting a wash-and-go routine
- Moderate volume — curls spring upward but maintain control
- Gold hoop or stud earring as style accent
- No visible parting — hair grows uniformly

### Ideal For
Oval, diamond, and oblong face shapes. Natural curls add width and softness to angular features. This wash-and-go approach is low-maintenance once the routine is established — apply curl cream to wet hair, scrunch, and air dry. Trim every 6-8 weeks to maintain shape.`,
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

  // 5 — Afros/male
  {
    name: 'Rounded Mini Afro with Confident Posture',
    category: 'Afros',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/4359671/pexels-photo-4359671.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 49,
    ai_description: `### Title: Rounded Mini Afro with Confident Posture

### Overview
A natural portrait of a young man with a well-shaped mini afro, captured with confident posture and relaxed expression. The afro is grown to approximately 3-4 inches — enough length to showcase the natural coily texture while maintaining a compact, rounded shape. This length represents the sweet spot where natural hair has enough volume to make a statement but stays manageable for daily life. The rounded silhouette is achieved through regular picking and selective trimming.

### Styling Details
- Mini afro approximately 3-4 inches from scalp
- Rounded, shaped silhouette with even volume distribution
- 4A/4B coil pattern visible throughout
- Natural dark black color with no treatment
- Shape maintained through regular picking/fluffing
- Compact enough for daily low-maintenance wear
- No visible parting — uniform growth pattern
- Healthy, moisturized appearance with natural matte finish

### Ideal For
All face shapes. The mini afro is the most versatile length for natural hair on men — substantial enough to make a style statement but short enough to be entirely fuss-free. Daily maintenance is minimal: moisturize, pick if desired, and go. Perfect transitional style for men growing out a big chop or maintaining preferred length.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B',
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

  // 6 — Bob/male
  {
    name: 'Textured Gentleman Crop with Clean Edges',
    category: 'Bob',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/3748221/pexels-photo-3748221.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 54,
    ai_description: `### Title: Textured Gentleman Crop with Clean Edges

### Overview
A polished portrait of a stylish man with a textured, well-groomed hairstyle featuring medium-length hair that sits close to the head with defined texture. The styling demonstrates precision barbering — clean edges, measured volume, and intentional texture placement. The overall effect is sophisticated and modern — a style that bridges the gap between classic grooming and contemporary texture trends.

### Styling Details
- Short-to-medium length with textured volume on top
- Clean, defined edges around the hairline and temples
- Natural dark black color with healthy luster
- Textured styling with deliberate movement and wave pattern
- Volume concentrated at the crown, tapering toward the sides
- Possible brush or sponge technique for defined curl pattern
- Well-groomed overall appearance suggesting regular barber visits
- Medium hold product for texture and definition

### Ideal For
Oval, oblong, and diamond face shapes. The textured volume on top adds dimension while the clean sides maintain structure. A sophisticated modern style that works in professional corporate settings while still having creative edge. Requires regular barber maintenance every 2-3 weeks and daily styling with texture product.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3C',
      length: 'short',
      fadeType: 'none',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 7 — Weaves/male
  {
    name: 'Vibrant Urban Style with Street Art Backdrop',
    category: 'Weaves',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 51,
    ai_description: `### Title: Vibrant Urban Style with Street Art Backdrop

### Overview
An energetic portrait of a young man with a styled extended hairstyle set against a vibrant, colorful urban wall. The hair features added length and texture that creates visual drama — whether through weave extensions, crochet method, or natural growth enhanced with product. The colorful street art backdrop complements the creative energy of the hairstyle, creating a cohesive portrait of urban self-expression. The subject stands confidently, hair styled to showcase maximum visual impact.

### Styling Details
- Extended-length styling reaching past the ears
- Added texture or extensions creating volume and movement
- Dark base color with natural appearance
- Styled to hang freely with creative arrangement
- Natural-looking installation blending with hairline
- Youthful, trend-forward aesthetic
- Creative arrangement showcasing length and flow
- Possible combination of natural hair and added extensions

### Ideal For
All face shapes. Extended styling for men creates a dramatic, fashion-forward look popular in creative industries, music, and street fashion culture. The added length offers styling versatility — can be worn down, tied up, or braided. A bold style that challenges traditional masculine hair norms.`,
    attributes: {
      hairType: 'woven',
      hairTexture: '3C',
      length: 'medium',
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
      promptFamily: 'protective-install',
    },
  },

  // 8 — Bob/male
  {
    name: 'Sculpted Wave Pattern with Sharp Temple Taper',
    category: 'Bob',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 53,
    ai_description: `### Title: Sculpted Wave Pattern with Sharp Temple Taper

### Overview
An artistically composed portrait of a man with a sculpted hairstyle featuring carefully maintained waves and clean barbering. The selective focus photography technique draws the viewer's eye directly to the subject's hair and facial features. The hair demonstrates expert grooming — a polished wave pattern on top with clean lines at the temples and edges, representing the intersection of classic barbering traditions and modern styling sophistication.

### Styling Details
- Short-to-medium length hair on top with defined wave pattern
- Clean, sculpted edges at temples and hairline
- 360-wave or brush technique creating visible ripple pattern
- Natural dark black color with healthy sheen from pomade
- Sharp contrast between styled top and tapered sides
- Medium hold styling product creating controlled wave definition
- Clean, precise barbering visible at all edges
- Professional composition highlighting texture and pattern

### Ideal For
Round, square, and oval face shapes. The wave pattern adds visual interest and sophistication while the clean edges create structure. A style deeply rooted in Black barbering culture that communicates attention to detail and pride in grooming. Requires dedicated brushing routine and regular barber visits every 1-2 weeks.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '3A',
      length: 'short',
      fadeType: 'taper',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // 9 — Fashion/male
  {
    name: 'Creative Editorial with Textured Crown Volume',
    category: 'Fashion',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/6147258/pexels-photo-6147258.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 56,
    ai_description: `### Title: Creative Editorial with Textured Crown Volume

### Overview
A high-impact editorial portrait of a man with an artistically styled textured hairstyle that pushes creative boundaries. The fashion-forward approach demonstrates how men's grooming has evolved beyond simple cuts into full creative expression. The textured crown creates height and visual drama, while the overall styling communicates confidence, creativity, and fashion awareness.

### Styling Details
- Textured volume on top creating height and dimension
- Artistic arrangement with intentional volume distribution
- Natural dark color with possible subtle highlights from lighting
- Creative styling product usage for hold and definition
- Volume concentrated at the crown and front for maximum impact
- Possible contrast between top and sides
- Fashion-forward aesthetic — editorial quality styling
- Clean edges creating contrast with textured top

### Ideal For
All face shapes — fashion styles transcend conventional face-shape rules. The textured crown adds height and drama regardless of facial proportions. Best suited for creative professionals, performers, and men who view their hair as artistic expression. Requires daily styling time and regular professional cuts.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'none',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 10 — Weaves/male
  {
    name: 'Modern Man Unit with Textured Wave Install',
    category: 'Weaves',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 52,
    ai_description: `### Title: Modern Man Unit with Textured Wave Install

### Overview
A clean, modern portrait of a young man with a precisely styled textured hairstyle featuring wave-like patterns. The hair sits perfectly — every strand in place — with a uniform wave pattern and density that creates a polished, high-fashion appearance. The man wears a clean polo shirt, suggesting the style's versatility for both casual and semi-formal settings. The overall grooming is impeccable, demonstrating how modern men's hair systems have become indistinguishable from natural hair.

### Styling Details
- Medium-length textured waves on top with uniform pattern
- Expertly blended installation — natural-looking density
- Natural dark black color with healthy luster
- Wave pattern runs from front to back with consistent depth
- Clean sides — tapered for contrast with textured top
- Healthy, lustrous appearance from professional maintenance
- Natural-looking hairline and density
- Styled with medium-hold product for wave definition

### Ideal For
All face shapes. Man units offer instant transformation and are increasingly popular for men wanting a specific look without the wait. The textured wave pattern is universally flattering and professional-appropriate. Requires professional installation and maintenance every 2-4 weeks.`,
    attributes: {
      hairType: 'woven',
      hairTexture: '3B',
      length: 'short',
      fadeType: 'taper',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'protective-install',
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
