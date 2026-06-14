/**
 * Batch 12 Seed Script — 10 new hairstyles (Global Diversity)
 * DB before: ~319 total | Target after: ~329
 *
 * Continents: Africa (Ghana, Nigeria), Latin America (Brazil), Mixed
 * Categories: Afros, Twists, Locs, Traditional, Coils, Protective, Weaves, Low Cut, Modern, Fades
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
  // 1 — Afros/female — Natural afro with flowers, dark studio (Africa)
  {
    name: 'Golden Bloom Natural Afro with Dark Backdrop',
    category: 'Afros',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/35665763/pexels-photo-35665763.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 58,
    ai_description: `### Title: Golden Bloom Natural Afro with Dark Backdrop

### Overview
A stunning editorial portrait of an African woman with a voluminous, perfectly rounded natural afro, holding a bouquet of vivid yellow flowers against a deep dark background. The afro is dense, well-defined, and shaped into a full spherical silhouette that frames the face beautifully. The contrast between the dark studio backdrop, the golden blooms, and the rich natural hair texture creates a powerful artistic statement celebrating Afrocentric beauty.

### Styling Details
- Full, rounded natural afro with 4B/4C coily texture
- Hair is picked out and shaped into a symmetrical sphere
- No visible parting — hair grows outward uniformly from all angles
- Medium-length coils stretched to maximum volume (approximately 5-6 inches)
- Natural sheen from moisturizing with leave-in conditioner or oil
- No heat styling — fully natural texture maintained
- Edges softly blended into the main body of the afro

### Ideal For
Oval, heart, and diamond face shapes. A bold, statement-making style that celebrates natural coily hair at its fullest potential. Perfect for editorial shoots, cultural events, or anyone wanting to showcase the beauty of unmanipulated African hair texture.`,
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
      promptFamily: 'natural-textured',
    },
  },

  // 2 — Twists/female — Twisted updo with bold styling (Africa)
  {
    name: 'Confident Twisted Updo with Bold Styling',
    category: 'Twists',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/36297542/pexels-photo-36297542.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 55,
    ai_description: `### Title: Confident Twisted Updo with Bold Styling

### Overview
A striking portrait showcasing medium-length two-strand twists styled into an elegant updo arrangement. The twists are neatly formed with consistent sizing and spacing, gathered and pinned upward to create a sculptural crown effect. The subject exudes confidence with the hair pulled away from the face, highlighting the geometric beauty of the twist pattern while keeping everything polished and intentional.

### Styling Details
- Medium-length two-strand twists (approximately 8-10 inches when unraveled)
- Twists gathered and pinned into an updo/top arrangement
- Consistent twist size throughout — approximately pencil-width
- Clean, defined edges with no flyaways
- Slight sheen from twist cream or natural oil application
- Secure pinning with bobby pins hidden within the twist structure
- Face-framing sections left softly twisted for dimension

### Ideal For
All face shapes, especially round and square. The updo elongates the face and draws attention upward. An excellent protective style that keeps ends tucked away while remaining elegant enough for professional settings and special occasions. Lasts 2-4 weeks with proper nighttime care.`,
    attributes: {
      hairType: 'twisted',
      hairTexture: '4A',
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
      promptFamily: 'braids-twists',
    },
  },

  // 3 — Locs/female — Dreadlocks updo outdoor Ghana
  {
    name: 'Ghanaian Locs Updo with Outdoor Radiance',
    category: 'Locs',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/18790491/pexels-photo-18790491.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 60,
    ai_description: `### Title: Ghanaian Locs Updo with Outdoor Radiance

### Overview
A joyful portrait of a Ghanaian woman in Kumasi showcasing a trendy dreadlocks updo hairstyle. The locs are mature, well-maintained, and gathered into a high bun/updo that sits atop the head, creating a regal silhouette. Captured outdoors in natural sunlight, the warm golden-hour lighting highlights the rich dark brown tones of the locs and their smooth, polished surface. The smiling subject radiates confidence and natural beauty.

### Styling Details
- Mature locs (likely 2+ years of growth) gathered into a high bun updo
- Locs are medium-thickness, uniform in size throughout
- Smooth loc surface indicating regular palm-rolling maintenance
- High placement creates an elegant, elongating effect
- Some locs wrapped around the base to secure the bun naturally
- Clean hairline with no buildup or frizz at the roots
- Natural dark brown/black color with subtle warm undertones from sun exposure

### Ideal For
All face shapes. The high updo creates vertical lines that elongate round faces and balance wider features. A sophisticated take on locs that transitions easily from casual to formal. Ideal for warm weather — keeps hair off the neck while maintaining style. Low daily maintenance once locs are established.`,
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

  // 4 — Traditional/male — Brazilian man with braids, side profile (Latin America)
  {
    name: 'Brazilian Braids Profile with Urban Texture',
    category: 'Traditional',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/34443942/pexels-photo-34443942.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 52,
    ai_description: `### Title: Brazilian Braids Profile with Urban Texture

### Overview
A powerful side-profile portrait of a Brazilian man in São Paulo showcasing tightly braided cornrows pulled back along the scalp. The braids are neat, geometric, and follow the natural curve of the head from the hairline to the nape. Set against a rustic textured wall, the portrait captures the intersection of urban Brazilian culture and traditional braiding craftsmanship. The subject's tattoos, chain necklace, and black tank top complement the street-smart aesthetic of this versatile protective style.

### Styling Details
- Straight-back cornrow braids running from hairline to nape
- Tight, uniform braiding with clean partings visible between rows
- Approximately 8-10 parallel rows of braids
- Braids extend past the nape into short free-hanging ends
- Clean temple lines and natural hairline — no razor edging
- Scalp visible between rows showing precise geometric sectioning
- No extensions — natural hair braided close to the scalp

### Ideal For
All face shapes, particularly strong-jawed and angular features. Cornrows are the original unisex protective style — keeping hair neat for 2-4 weeks with minimal daily maintenance. Popular across Latin American and Caribbean urban culture as both a practical and fashion-forward choice.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '3C',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'flat',
      partingPattern: 'geometric',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 5 — Coils/female — Short curly hair portrait, white studio background (Mixed/Latin)
  {
    name: 'Radiant Short Coils with Clean Studio Light',
    category: 'Coils',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/6343295/pexels-photo-6343295.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 56,
    ai_description: `### Title: Radiant Short Coils with Clean Studio Light

### Overview
A beautifully lit studio portrait of a smiling woman with short, defined coily curls against a clean white background. The hair is cropped close in a flattering pixie-length style, showcasing tight 3C/4A coil patterns that create a soft halo of texture around the face. The minimal white background and elegant earrings create a timeless, editorial quality that lets the natural hair texture be the star. The subject's genuine smile adds warmth and approachability.

### Styling Details
- Short coily hair, approximately 2-3 inches in length
- Defined 3C/4A curl pattern visible throughout
- Uniform length on top with slightly shorter sides
- Moisturized coils with a natural, soft finish (no crunchiness)
- No visible parting — hair grows uniformly upward and outward
- Edges softly blended — no hard lines or razor work
- Styled with leave-in conditioner or curl cream for definition

### Ideal For
Oval, heart, and oblong face shapes. A low-maintenance celebration of natural texture that requires minimal daily styling — just moisturize and go. Perfect for women who want a short, chic look that showcases their natural curl pattern without heat damage or manipulation.`,
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

  // 6 — Protective/male — Brazilian man with braids, black tank top (Latin America)
  {
    name: 'Braided Protective Set with Black Tank Style',
    category: 'Protective',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/34443925/pexels-photo-34443925.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 50,
    ai_description: `### Title: Braided Protective Set with Black Tank Style

### Overview
A confident frontal portrait of a Brazilian man in São Paulo wearing tight cornrow braids that flow from the hairline straight back. Dressed in a simple black tank top, the subject showcases the braids as the focal point — clean, symmetrical, and freshly installed. The braids are complemented by visible tattoos on the arms, creating an urban street style aesthetic that's both practical and fashion-forward. This protective style keeps the hair neat while making a bold visual statement.

### Styling Details
- All-back cornrow braids with uniform width and tension
- Fresh installation with clean, moisturized scalp visible between rows
- Braids start from the front hairline and follow back to the nape
- Consistent braid thickness — approximately half-inch per row
- Natural hair braided without extensions for a sleek, close-to-scalp look
- No undercut or fade — full coverage braiding from temple to temple
- Ends either tucked under or cut flush at the nape

### Ideal For
All face shapes and hair textures from 3B to 4C. A masculine protective style that's popular across Brazilian, Caribbean, and African urban cultures. Lasts 2-4 weeks with proper moisturizing and overnight protection. Excellent for active lifestyles — gym, sports, and outdoor activities.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '3C',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'flat',
      partingPattern: 'geometric',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 7 — Weaves/female — Braided install in tall grasses with orange dress (Brazil)
  {
    name: 'Bohemian Braided Install in Autumn Grasses',
    category: 'Weaves',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/3122087/pexels-photo-3122087.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 54,
    ai_description: `### Title: Bohemian Braided Install in Autumn Grasses

### Overview
A fashionable outdoor portrait of a woman with long braided extensions styled in a bohemian, free-flowing manner amidst tall golden grasses. She wears a vibrant orange dress that complements the warm autumn tones of the setting. The braids are waist-length, individually installed, and hang freely — some with subtle curled or wavy ends that add a goddess-locs aesthetic. The overall vibe is earthy, fashionable, and effortlessly chic.

### Styling Details
- Long individual braids (box braids or goddess braids) extending to waist-length
- Extensions added for length and fullness
- Some braids feature loose, curly ends for a bohemian/goddess effect
- Hair parted naturally with braids flowing freely on all sides
- Medium-thickness braids — approximately pencil-width
- Natural dark brown/black color matching the subject's natural hair
- Face-framing braids styled to fall forward for dimension

### Ideal For
All face shapes. Long braided installs are universally flattering and incredibly versatile — can be worn down, up, half-up, or in elaborate updos. A low-maintenance protective style that lasts 6-8 weeks. The bohemian goddess-braid variation adds a romantic, carefree quality that works for both everyday and special occasions.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A',
      length: 'extra-long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'protective-install',
    },
  },

  // 8 — Low Cut/female — Confident modern short natural (Africa)
  {
    name: 'Playful Short Natural with Modern Confidence',
    category: 'Low Cut',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/30220176/pexels-photo-30220176.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 48,
    ai_description: `### Title: Playful Short Natural with Modern Confidence

### Overview
A vibrant portrait of a confident young African woman with a closely cropped natural hairstyle, striking a playful pose that exudes modern energy and self-assurance. The hair is cut very short — barely an inch — showcasing the natural curl pattern in a tapered, feminine shape. The style perfectly frames the face and highlights the subject's features, proving that ultra-short hair can be both feminine and bold.

### Styling Details
- Very short natural hair, approximately 0.5-1 inch in length
- Tapered shape — slightly longer on top, softly blended at the temples and nape
- Natural 4A/4B coil pattern visible even at this short length
- No defined parting — uniform growth pattern
- Moisturized with natural sheen from oil or curl cream
- Edges left soft and natural — no gel or hard edges
- No color treatment — pure natural black

### Ideal For
Oval, heart, and angular face shapes. The ultimate low-maintenance style — wash, moisturize, and go. A bold choice that centers facial features and bone structure. Perfect for women who want to embrace their natural texture without the commitment of longer styling routines. Grows out beautifully into a TWA over 3-6 months.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B',
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

  // 9 — Modern/male — City street gentleman with groomed beard (Latin America)
  {
    name: 'City Gentleman with Groomed Textured Waves',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/9122840/pexels-photo-9122840.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 53,
    ai_description: `### Title: City Gentleman with Groomed Textured Waves

### Overview
A stylish urban portrait of a Brazilian man in a city street setting, showcasing a modern medium-length hairstyle with textured waves swept back and to the side. The hair is paired with a full, well-groomed beard that creates a masculine, put-together look. Wearing a refined gray cardigan, the subject projects an effortlessly sophisticated vibe — the kind of man who takes grooming seriously without appearing overdone. The natural outdoor lighting highlights the wave pattern and healthy shine.

### Styling Details
- Medium-length hair (3-4 inches on top) with natural wave/curl pattern
- Swept back and to the side in a relaxed pompadour-like shape
- Sides slightly shorter, blending naturally into the longer top
- Natural 2B/2C wave texture enhanced with sea salt spray or texturizing product
- Full beard groomed to complement the hairstyle's clean lines
- Matte to low-sheen finish — product present but not heavy
- No hard parting — natural flow direction dictates the style

### Ideal For
All face shapes, especially round and oval. The swept-back volume adds height and structure while the full beard grounds the look. A versatile modern men's style that works for creative professionals, casual settings, and date nights alike. Requires regular trims every 4-6 weeks to maintain shape.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2C',
      length: 'medium',
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

  // 10 — Fades/female — Cheerful tapered crop with star earrings (Mixed/Latin)
  {
    name: 'Cheerful Tapered Crop with Star Earring Accent',
    category: 'Fades',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/30220175/pexels-photo-30220175.jpeg?cs=srgb&w=1200',
    price: 0,
    popularity: 51,
    ai_description: `### Title: Cheerful Tapered Crop with Star Earring Accent

### Overview
A warm, cheerful portrait of a woman with a beautifully tapered short crop that showcases defined natural curls. The hair is longer on top (2-3 inches) and gradually tapers shorter at the sides and nape, creating a feminine yet edgy silhouette. Star-shaped earrings add a playful accessory element that complements the cropped cut. The subject's warm smile and the soft lighting create an inviting, approachable portrait that celebrates short natural hair.

### Styling Details
- Tapered short crop — longer on top (2-3 inches), shorter at sides and nape
- Defined 3C/4A curl pattern visible on top
- Gradual taper from crown to ear level — not a hard fade
- Curls on top styled with definition cream for soft, touchable hold
- Natural volume concentrated at the crown for height
- Clean ear exposure with soft temple lines
- No hard edges or razor lines — feminine soft taper transition

### Ideal For
Oval, heart, and diamond face shapes. The taper creates a slimming effect on rounder faces while the volume on top adds flattering height. A chic, modern take on the tapered natural that bridges the gap between a bold fade and a soft pixie. Low maintenance — just moisturize and scrunch the top curls.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3C',
      length: 'short',
      fadeType: 'taper',
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
