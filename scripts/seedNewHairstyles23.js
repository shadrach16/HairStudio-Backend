/**
 * Batch 23 Seed Script - 10 fresh verified hairstyle records
 * Live DB before latest run: 369 total | Target after: 379
 *
 * Images are Pexels-sourced, direct URLs were verified, and review copies were
 * visually inspected for clean hairstyle visibility before production seeding.
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
    console.log(`  Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    console.error(`  Upload failed for ${publicId}:`, err.message);
    throw err;
  }
}

// ---------- Hairstyle Data ----------
const newHairstyles = [
  // 1 - Coils/male
  {
    name: 'Soft Ash-Brown Curly Crop with Airy Fringe',
    category: 'Coils',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/22707229/pexels-photo-22707229.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 58,
    ai_description: `### Title: Soft Ash-Brown Curly Crop with Airy Fringe

### Overview
A close, bright portrait showing a short curly crop with soft ash-brown highlights through the top. The curls are loose, airy, and clearly separated, with a light fringe falling forward across the forehead. The crop sits close around the sides and back while the top carries most of the texture and movement. The pale background makes the hairstyle easy to read, especially the curl shape and natural lift.

### Styling Details
- Short-to-medium curly crop with visible 3A/3B ringlets
- Airy forward fringe with soft curls resting near the forehead
- Natural brown base with ash-brown light reflection through the top
- Compact sides and back with no hard fade or sharp line-up
- No visible part; curls are arranged in a free, organic pattern
- Lightweight curl cream or mousse finish for separation
- Soft, low-shine texture rather than a wet or rigid set

### Ideal For
Oval, heart, and narrow face shapes. The soft fringe frames the forehead while the controlled side volume keeps the cut neat. Maintain with curl hydration, gentle diffusing or air drying, and regular trims to prevent the fringe from becoming heavy.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3A/3B',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'ash-brown',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 2 - Bob/male
  {
    name: 'Carefree Street Curl Bob with Rounded Volume',
    category: 'Bob',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/7446735/pexels-photo-7446735.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 60,
    ai_description: `### Title: Carefree Street Curl Bob with Rounded Volume

### Overview
A lively outdoor portrait of a medium-length curly bob worn loose and natural. The curls expand around the head in a rounded shape, falling to the sides and around the ears with a relaxed street-style feel. The smile and bright city setting make the look approachable, while the hair remains the clearest visual feature. This is a soft male curly bob with natural movement rather than a heavily barbered cut.

### Styling Details
- Medium-length curls forming a rounded bob-like outline
- Loose 3B/3C curl pattern with spring and bounce
- Natural dark brown color with subtle warm highlights
- Full side volume around the ears and cheeks
- No hard part, fade, or undercut visible
- Air-dried or diffused finish with light curl definition
- Natural frizz at the perimeter that keeps the look casual

### Ideal For
Oval, square, and long face shapes. The rounded width softens angular features and balances longer profiles. Maintenance works best with leave-in conditioner, curl cream, and light shaping trims to keep the sides balanced without removing too much volume.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3B/3C',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 3 - Fashion/male
  {
    name: 'Pastel Cardigan Cloud Curls with Editorial Lift',
    category: 'Fashion',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/15265542/pexels-photo-15265542.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 64,
    ai_description: `### Title: Pastel Cardigan Cloud Curls with Editorial Lift

### Overview
A fashion portrait featuring a lifted cloud of dark curls styled above a pastel cardigan and bright sky. The hair has strong height and width, with defined coils visible across the front edge and sides. Sunglasses and styling partially cover the face, but the hair remains cleanly visible and central to the image. The result is expressive, editorial, and modern without losing the natural curl texture.

### Styling Details
- High-volume curly cloud with rounded top expansion
- Dense 3C curls with visible individual spirals at the front
- Natural black to dark brown color with outdoor highlights
- No defined parting; curls are free-form and lifted outward
- Full crown volume with soft side spread
- Minimal edge work, relying on natural shape and volume
- Styled with leave-in moisture and light hold for lift

### Ideal For
Oval, heart, and diamond face shapes. The elevated curl volume adds visual drama and complements fashion-forward outfits. Maintain with moisturizing products, gentle picking at the roots, and occasional shape trims to keep the cloud silhouette intentional.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3C',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'free-form',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 4 - Braids/male
  {
    name: 'Beaded Low Braids with Blue Studio Backdrop',
    category: 'Braids',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/37124631/pexels-photo-37124631.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 59,
    ai_description: `### Title: Beaded Low Braids with Blue Studio Backdrop

### Overview
A clean studio portrait showing low, pulled-back braids with colorful beads visible near the ends. The bright blue background and red jacket create strong contrast, making the hairline, braid direction, and bead accents readable. The braids sit close to the scalp at the top and trail behind the ears, giving the style a neat, youthful profile. It is a compact protective style with a polished portrait finish.

### Styling Details
- Low braids pulled back from the hairline
- Small bead accents in black, white, green, and blue near the braid ends
- Natural black hair with neat scalp tension at the front
- Braids fall behind the ears and toward the nape
- Clean forehead and temple area without heavy loose fringe
- Low volume and close-to-head structure
- Fresh protective finish with minimal frizz

### Ideal For
Oval, round, and square face shapes. The pulled-back braid direction opens the face while the beads add personality. Maintain by wrapping at night, moisturizing the scalp lightly, and checking beads or ends so the style stays secure.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'cornrow',
      volumeProfile: 'low',
      partingPattern: 'geometric',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 5 - Braids/male
  {
    name: 'Sunlit Athletic Box Braids with Center Fall',
    category: 'Braids',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/6007196/pexels-photo-6007196.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 62,
    ai_description: `### Title: Sunlit Athletic Box Braids with Center Fall

### Overview
A bright outdoor portrait of long box braids worn loose around the face and shoulders. The sunlight makes the braid pattern, length, and individual sections clearly visible, with shadows from the braids falling across the upper body. The style has an athletic, confident feel and shows how long braids can remain practical while still looking expressive. The center fall frames the face evenly.

### Styling Details
- Long individual box braids reaching past the shoulders
- Medium-small braid size with consistent thickness
- Center-falling arrangement around both sides of the face
- Natural black to dark brown color with sunlit highlights
- Clean root sections and controlled braid tension
- Low-to-medium volume despite the long length
- Loose ends with natural movement in the lower braid lengths

### Ideal For
Oval, rectangular, and heart face shapes. The long vertical braid lines elongate the face and create a strong, polished silhouette. Maintain with scalp care, satin wrapping, and careful cleansing so the braid roots stay neat without drying the scalp.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'box-braid',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 6 - Afros/male
  {
    name: 'Monochrome High Afro with Soft Side Taper',
    category: 'Afros',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/10306013/pexels-photo-10306013.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 61,
    ai_description: `### Title: Monochrome High Afro with Soft Side Taper

### Overview
A black-and-white portrait centered on a tall natural afro with a soft taper around the sides. The hair rises upward with airy texture and an intentionally imperfect perimeter, giving the style an artistic, natural finish. The monochrome lighting separates the curl mass from the background well, making the height and side shape easy to see. It is a refined afro look with a subtle editorial mood.

### Styling Details
- High natural afro with strong vertical lift
- Dense 3C/4A curls expanded upward and outward
- Soft taper around the sideburn and lower side area
- Natural dark hair shown in monochrome photography
- No visible part or hard barber line
- Airy perimeter with natural frizz and curl separation
- Light picking at the roots for height and shape

### Ideal For
Oval, diamond, and round face shapes. The height elongates the profile while the soft side taper keeps the silhouette balanced. Maintain with hydration, gentle picking, and occasional trimming around the sides to preserve the lifted shape.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '3C/4A',
      length: 'medium',
      fadeType: 'taper',
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

  // 7 - Afros/male
  {
    name: 'Color-Wash Rounded Afro with Full Silhouette',
    category: 'Afros',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/18372354/pexels-photo-18372354.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 67,
    ai_description: `### Title: Color-Wash Rounded Afro with Full Silhouette

### Overview
A studio portrait featuring a large rounded afro under red and blue editorial lighting. The color wash adds drama, but the hairstyle remains readable: a full, dense natural shape with strong width, height, and a soft textured perimeter. The afro frames the face evenly and creates a bold fashion statement. This is a high-volume natural look with a clear silhouette and strong visual identity.

### Styling Details
- Full rounded afro with wide side volume and crown height
- Dense 4A/4B texture expanded into a soft halo shape
- Natural black base affected by red and blue studio lighting
- No parting, braids, or loc structure visible
- Soft perimeter with natural frizz and curl density
- Picked-out volume while keeping a balanced circular outline
- Minimal product shine; texture remains matte and natural

### Ideal For
Oval, long, and diamond face shapes. The rounded width balances narrow features and creates an expressive fashion profile. Maintain with moisture-rich products, gentle detangling, and periodic shape trims to keep the afro balanced.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A/4B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'very-high',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 8 - Bob/male
  {
    name: 'Copper Shoulder-Length Ringlets with Center Fall',
    category: 'Bob',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/17533850/pexels-photo-17533850.png?cs=srgb&w=1200',
    price: 2,
    popularity: 65,
    ai_description: `### Title: Copper Shoulder-Length Ringlets with Center Fall

### Overview
A close portrait of shoulder-length copper ringlets with a soft center fall around the face. The curls are very clearly defined, with tight spiral pieces across the front and fuller curly panels on both sides. Warm sunlight highlights the copper tone and makes the curl pattern vivid. The length, shape, and center framing give the style a curly bob feel with a polished editorial edge.

### Styling Details
- Shoulder-length curly bob with strong 3B ringlet definition
- Center fall with face-framing spirals over the forehead and cheeks
- Warm copper-brown color with sunlit golden highlights
- Full side volume, especially through the lower curl panels
- No fade, undercut, or hard part visible
- Defined curl finish from cream, gel, or careful diffusing
- Soft natural frizz that keeps the ringlets dimensional

### Ideal For
Oval, heart, and angular face shapes. The center fall frames the face symmetrically while the copper color adds warmth and personality. Maintain with curl-safe cleansing, leave-in moisture, and regular trims to keep the shoulder-length outline even.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'center',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'copper-brown',
      hasColorTreatment: true,
      colorNotes: 'Warm copper-brown curl color with golden sunlit highlights.',
      promptFamily: 'standard',
    },
  },

  // 9 - Modern/male
  {
    name: 'Loose Shoulder-Length Curls with Velvet Suit Polish',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/18070346/pexels-photo-18070346.png?cs=srgb&w=1200',
    price: 2,
    popularity: 60,
    ai_description: `### Title: Loose Shoulder-Length Curls with Velvet Suit Polish

### Overview
A modern fashion portrait of loose shoulder-length curls worn with a black velvet suit. The hair falls past the ears and around the shoulders, with natural curl movement visible against the plain concrete backdrop. The look is relaxed but refined, pairing longer curls with formal styling. The curls are not overly sculpted, giving the hairstyle an effortless editorial feel.

### Styling Details
- Shoulder-length loose curls with natural movement
- 2C/3A curl pattern forming elongated ringlets and waves
- Natural dark brown color with subtle outdoor highlights
- Soft center-to-free-form fall around the face and shoulders
- No fade, hard part, or short side contrast
- Low-to-medium volume with length providing most of the shape
- Air-dried or lightly diffused finish for a relaxed texture

### Ideal For
Oval, rectangular, and square face shapes. The length softens the jaw and creates a refined creative profile. Maintain with conditioner, curl cream, and light trimming at the ends so the shoulder-length shape stays polished rather than stringy.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '2C/3A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 10 - Braids/male
  {
    name: 'Side-Profile Stitch Braids with City Glow',
    category: 'Braids',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/18727812/pexels-photo-18727812.png?cs=srgb&w=1200',
    price: 2,
    popularity: 66,
    ai_description: `### Title: Side-Profile Stitch Braids with City Glow

### Overview
A sharp side-profile portrait showing stitch-style braids running back from the hairline into longer trailing braids. The city-light background and close framing make the parting, braid direction, and scalp pattern very clear. The braided rows sit flat and glossy along the scalp before extending behind the head, creating a sleek protective look with strong editorial presence.

### Styling Details
- Stitch braids directed backward from the front hairline
- Clean geometric parting lines visible along the side profile
- Longer trailing braids extending behind the neck and shoulders
- Natural black hair with a glossy, controlled finish
- Neat temple area and defined braid tension
- Low-volume scalp section with length carried in the back
- Minimal frizz and a freshly installed appearance

### Ideal For
Oval, square, and heart face shapes. The backward braid direction elongates the profile and exposes the face cleanly. Maintain by wrapping at night, keeping the scalp moisturized, and refreshing the hairline if the front rows loosen.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'feed-in-braid',
      volumeProfile: 'low',
      partingPattern: 'geometric',
      complexity: 'highly-intricate',
      requiresEdgeWork: true,
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
    console.error('No MONGO_URI found in environment');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB\n');

  let created = 0;
  let skipped = 0;

  for (const style of newHairstyles) {
    console.log(`Processing: ${style.name} (${style.category}/${style.gender})`);

    const exists = await Hairstyle.findOne({ name: style.name });
    if (exists) {
      console.log('  Already exists - skipping');
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

    console.log(`  Created: ${style.name}`);
    created++;
  }

  console.log(`\nDone - Created: ${created} | Skipped: ${skipped}`);
  const total = await Hairstyle.countDocuments();
  console.log(`Total hairstyles in DB: ${total}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});