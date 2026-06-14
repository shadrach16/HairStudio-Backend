/**
 * Batch 24 Seed Script - 10 fresh verified hairstyle records
 * Live DB before latest run: 379 total | Target after: 389
 *
 * Direct Pexels image URLs were verified, review copies were visually inspected,
 * and selected images were rejected if the hairstyle was dark, obscured, or unclear.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Hairstyle = require('../models/Hairstyle');

const EXPECTED_PRE_COUNT = 379;

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
  // 1 - Low Cut/female
  {
    name: 'Auburn Textured Pixie with Soft Side Sweep',
    category: 'Low Cut',
    gender: 'female',
    sourceId: '6211981',
    sourcePage: 'https://www.pexels.com/photo/studio-shot-of-a-young-woman-with-short-hair-wearing-a-tulle-dress-6211981/',
    sourceCredit: 'Pexels photo 6211981',
    sourceUrl: 'https://images.pexels.com/photos/6211981/pexels-photo-6211981.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 62,
    ai_description: `### Title: Auburn Textured Pixie with Soft Side Sweep

### Overview
A clean studio portrait showing a short auburn pixie cut with a soft, side-swept top. The hair is cropped close around the ears and nape, while the crown carries light texture and feathered movement. The warm red-brown color catches the studio light clearly, making the cut shape, direction, and texture easy to read. This is a polished short style with feminine softness rather than a harsh buzz cut.

### Styling Details
- Short pixie silhouette with close sides and nape
- Longer textured crown swept diagonally across the forehead
- Warm auburn color with copper-red highlights under studio lighting
- Soft volume through the top, controlled close to the head
- No hard part, fade, or shaved design
- Lightweight styling paste or mousse for airy separation
- Clean neckline and ear area for a neat low-cut finish

### Ideal For
Oval, heart, and diamond face shapes. The side sweep softens the forehead and highlights cheekbones while keeping daily styling simple. Maintain with a trim every 4-6 weeks and a small amount of texturizing product to keep the crown lifted without stiffness.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C/2A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'auburn',
      hasColorTreatment: true,
      colorNotes: 'Warm auburn/copper short pixie color.',
      promptFamily: 'standard',
    },
  },

  // 2 - Bob/female
  {
    name: 'Ocean-Breeze Blunt Bob with Micro Bangs',
    category: 'Bob',
    gender: 'female',
    sourceId: '22632055',
    sourcePage: 'https://www.pexels.com/photo/portrait-of-woman-with-eyes-closed-22632055/',
    sourceCredit: 'Pexels photo 22632055',
    sourceUrl: 'https://images.pexels.com/photos/22632055/pexels-photo-22632055.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 61,
    ai_description: `### Title: Ocean-Breeze Blunt Bob with Micro Bangs

### Overview
A soft outdoor portrait featuring a dark blunt bob with short micro bangs. The hair falls to the jawline and neck with a clean horizontal edge, while the short fringe sits well above the brows. A light breeze moves a few strands across the face, but the bob shape remains very visible. The pale water background gives clear contrast against the dark hair and emphasizes the compact, graphic outline.

### Styling Details
- Chin-to-neck length blunt bob with an even perimeter
- Short micro bangs cut above the brows
- Natural dark brown to black color
- Smooth, mostly straight texture with slight movement at the ends
- No layers, fade, or extension texture visible
- Subtle natural wind movement without hiding the overall cut
- Low-volume finish with a clean, editorial bob silhouette

### Ideal For
Oval, long, and heart face shapes. The micro fringe shortens the forehead visually while the blunt sides frame the jaw. Maintain with regular bang trims, smoothing serum, and a light blow-dry to keep the bob edge crisp.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C',
      length: 'short',
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
      promptFamily: 'standard',
    },
  },

  // 3 - Fashion/female
  {
    name: 'Jet-Black Wavy Bob with Baby Bangs',
    category: 'Fashion',
    gender: 'female',
    sourceId: '20670742',
    sourcePage: 'https://www.pexels.com/photo/portrait-of-woman-in-black-eyeshadow-and-red-lipsti-20670742/',
    sourceCredit: 'Pexels photo 20670742',
    sourceUrl: 'https://images.pexels.com/photos/20670742/pexels-photo-20670742.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 66,
    ai_description: `### Title: Jet-Black Wavy Bob with Baby Bangs

### Overview
A dramatic beauty portrait showing a jet-black wavy bob with sharp baby bangs. The hair falls just below the chin, with textured waves and piecey ends creating a fashion-forward finish. The short fringe is cut high and straight across, giving the style a bold editorial edge. The dark makeup and close framing support the hairstyle without hiding the cut, making the bob outline and fringe highly readable.

### Styling Details
- Short wavy bob ending around the chin and upper neck
- Straight baby bangs cut above the brows
- Jet-black color with subtle shine under studio lighting
- Loose, separated waves through the sides and ends
- Slightly tousled perimeter for movement and edge
- No visible hard part, fade, or extensions
- Styled with texturizing spray or light wax for piecey separation

### Ideal For
Oval, heart, and angular face shapes. The baby bangs draw attention to the eyes while the wavy sides soften the jawline. Best maintained with bang trims, wave refresh spray, and occasional shaping to keep the bob from becoming bulky at the ends.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'jet-black',
      hasColorTreatment: true,
      colorNotes: 'Glossy jet-black fashion bob finish.',
      promptFamily: 'standard',
    },
  },

  // 4 - Low Cut/female
  {
    name: 'Sleek Studio Pixie with Soft Forehead Fringe',
    category: 'Low Cut',
    gender: 'female',
    sourceId: '17217971',
    sourcePage: 'https://www.pexels.com/photo/head-shot-of-a-woman-with-short-hair-17217971/',
    sourceCredit: 'Pexels photo 17217971',
    sourceUrl: 'https://images.pexels.com/photos/17217971/pexels-photo-17217971.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 64,
    ai_description: `### Title: Sleek Studio Pixie with Soft Forehead Fringe

### Overview
A crisp studio close-up of a sleek black pixie cut with a soft fringe sweeping across the forehead. The hair is cropped very close at the sides and nape, while the top is slightly longer and combed forward in controlled pieces. The portrait lighting shows the compact shape clearly and reveals a smooth, polished finish. This is a refined low-cut style that feels minimal, elegant, and professional.

### Styling Details
- Short pixie cut with close sides and nape
- Slightly longer top combed forward into soft fringe pieces
- Natural black color with low-shine polish
- Compact silhouette that follows the head shape
- No visible part, hard line, or shaved pattern
- Smooth styling cream or light pomade for control
- Clean ear area and neckline for a precise finish

### Ideal For
Oval, diamond, and heart face shapes. The close sides open the face while the fringe adds softness around the forehead. Maintenance is simple but trim-dependent: refresh the cut every 3-5 weeks and use a small amount of smoothing product for direction.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 5 - Afros/female
  {
    name: 'Ornamental Gate Rounded Afro with Hoop Earrings',
    category: 'Afros',
    gender: 'female',
    sourceId: '11830095',
    sourcePage: 'https://www.pexels.com/photo/a-woman-in-black-tank-top-11830095/',
    sourceCredit: 'Pexels photo 11830095',
    sourceUrl: 'https://images.pexels.com/photos/11830095/pexels-photo-11830095.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 63,
    ai_description: `### Title: Ornamental Gate Rounded Afro with Hoop Earrings

### Overview
A clear outdoor portrait of a full rounded afro framed by large hoop earrings and an ornamental dark gate. The hair has a strong circular silhouette with dense natural texture visible across the top and sides. The background contrast keeps the afro shape readable, while the front-facing pose shows the volume and balance of the style. It is a classic natural afro look with a modern street-style finish.

### Styling Details
- Medium full afro with rounded side and crown volume
- Dense 4A/4B texture picked into a balanced shape
- Natural black color with subtle outdoor highlights
- No parting, braiding, or chemical straightening visible
- Soft perimeter with natural curl density and controlled frizz
- Height and width distributed evenly around the face
- Minimal styling beyond moisturizing, picking, and shape maintenance

### Ideal For
Oval, oblong, and diamond face shapes. The rounded shape adds width and softness while keeping a confident natural profile. Maintain with leave-in conditioner, gentle picking at the roots, and periodic shape trims to keep the silhouette symmetrical.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A/4B',
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

  // 6 - Afros/male
  {
    name: 'Espresso Cloud Afro with Tall Turtleneck Frame',
    category: 'Afros',
    gender: 'male',
    sourceId: '19112533',
    sourcePage: 'https://www.pexels.com/photo/man-with-afro-hairdo-posing-in-dark-brown-turtleneck-sweater-19112533/',
    sourceCredit: 'Pexels photo 19112533',
    sourceUrl: 'https://images.pexels.com/photos/19112533/pexels-photo-19112533.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 65,
    ai_description: `### Title: Espresso Cloud Afro with Tall Turtleneck Frame

### Overview
A fashion portrait centered on a large espresso-toned afro rising above a tall black turtleneck. The sweater covers the lower face, but the hairstyle is fully visible and clearly framed against the pale architectural background. The afro has a wide, rounded cloud shape with airy natural texture along the perimeter. This is a high-volume natural style with editorial polish.

### Styling Details
- Large rounded afro with substantial height and side width
- Dense 4A/4B texture expanded into a cloud-like silhouette
- Deep espresso-brown to natural-black color
- No visible parting, locs, braids, or fade
- Soft, natural perimeter with light frizz and curl density
- Crown volume balanced evenly on both sides
- Picked-out finish supported by moisture and gentle shaping

### Ideal For
Oval, long, and narrow face shapes. The width and height balance slim features while creating a bold fashion statement. Maintain with moisturizing cream, gentle detangling, night protection, and regular shaping trims to prevent uneven growth.`,
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
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'espresso-brown',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 7 - Braids/female
  {
    name: 'Platinum Double Dutch Braids with Long Tassel Ends',
    category: 'Braids',
    gender: 'female',
    sourceId: '32107399',
    sourcePage: 'https://www.pexels.com/photo/stylish-young-woman-with-long-braided-hair-outdoors-32107399/',
    sourceCredit: 'Pexels photo 32107399',
    sourceUrl: 'https://images.pexels.com/photos/32107399/pexels-photo-32107399.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 67,
    ai_description: `### Title: Platinum Double Dutch Braids with Long Tassel Ends

### Overview
A bright outdoor portrait showcasing two long platinum Dutch braids that run from the crown down the back. The braids are thick, clean, and symmetrical, with pale blonde extension hair creating a strong contrast against the natural darker roots. Long tassel ends finish the look and make the length clear. The hairstyle is visible from the crown to the ends, making it a strong catalog reference for long feed-in braids.

### Styling Details
- Two long Dutch/feed-in braids extending down the back
- Platinum blonde extension hair blended from darker roots
- Clean center part separating the two braid sections
- Thick braid structure with consistent tension and size
- Long tassel ends below the waist area
- Loose face-framing tendrils around the front
- Smooth scalp section with minimal frizz

### Ideal For
Oval, round, and heart face shapes. The twin vertical braid lines elongate the profile while the pale color makes a high-impact statement. Maintain by wrapping at night, smoothing flyaways, and refreshing the hairline or tendrils when they loosen.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '3C/4A',
      length: 'extra-long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'feed-in-braid',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'platinum-blonde',
      hasColorTreatment: true,
      colorNotes: 'Platinum blonde extension braids over darker roots.',
      promptFamily: 'braids-twists',
    },
  },

  // 8 - Protective/female
  {
    name: 'Blonde Micro Box Braids with Center Part',
    category: 'Protective',
    gender: 'female',
    sourceId: '35280076',
    sourcePage: 'https://www.pexels.com/photo/powerful-portrait-of-black-woman-with-braided-hair-35280076/',
    sourceCredit: 'Pexels photo 35280076',
    sourceUrl: 'https://images.pexels.com/photos/35280076/pexels-photo-35280076.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 66,
    ai_description: `### Title: Blonde Micro Box Braids with Center Part

### Overview
A close studio portrait focused on long blonde micro box braids with a clean center part. The braids fall forward around the face and shoulders, making the color, parting, and braid size easy to inspect. The blonde extension hair creates a striking contrast against the natural roots and skin tone. Despite the dramatic lighting, the braided texture remains clear and detailed.

### Styling Details
- Long micro-to-small box braids falling around the face
- Clean center part visible at the scalp
- Blonde extension color with darker natural roots
- Consistent braid size with fine woven texture
- Loose curled or feathered ends adding softness near the bottom
- Face-framing placement with high visual impact
- Protective installation with controlled root tension

### Ideal For
Oval, heart, and diamond face shapes. The center part frames the face symmetrically while the light color adds brightness and drama. Maintain with scalp oiling, satin wrapping, and gentle handling around the front rows to prevent tension and frizz.`,
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
      baseColor: 'blonde',
      hasColorTreatment: true,
      colorNotes: 'Blonde extension braids with darker natural root contrast.',
      promptFamily: 'protective-install',
    },
  },

  // 9 - Braids/female
  {
    name: 'Radiating Cornrow Crown with Scalp Precision',
    category: 'Braids',
    gender: 'female',
    sourceId: '33664383',
    sourcePage: 'https://www.pexels.com/photo/top-view-of-stylish-braided-hairstyle-on-woman-33664383/',
    sourceCredit: 'Pexels photo 33664383',
    sourceUrl: 'https://images.pexels.com/photos/33664383/pexels-photo-33664383.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 64,
    ai_description: `### Title: Radiating Cornrow Crown with Scalp Precision

### Overview
A top-down detail portrait that clearly displays a radiating cornrow pattern across the crown. The braids start from a central point and fan outward in neat, symmetrical rows, exposing clean scalp lines between each braid. This image is especially useful for showing parting accuracy and braid direction because the hairstyle is photographed from above. The style is precise, protective, and highly structured.

### Styling Details
- Cornrows arranged in a radial crown pattern
- Clean scalp partings fanning from a central point
- Small-to-medium braid thickness with consistent tension
- Natural black hair with subtle warm highlights from sunlight
- Braids lie flat and close to the scalp
- No loose extensions visible in the cropped top view
- Highly technical pattern requiring skilled sectioning

### Ideal For
Oval, round, and heart face shapes. The radial pattern creates a decorative crown effect while keeping the hair protected and close to the head. Maintain with scalp moisturizing, night wrapping, and careful edge care to keep the parting lines crisp.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A/4B',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'cornrow',
      volumeProfile: 'low',
      partingPattern: 'geometric',
      complexity: 'highly-intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 10 - Traditional/female
  {
    name: 'Sculptural Threaded Afro Puffs with Wrapped Spokes',
    category: 'Traditional',
    gender: 'female',
    sourceId: '16089262',
    sourcePage: 'https://www.pexels.com/photo/dark-photo-of-a-woman-with-an-unusual-hairstyle-16089262/',
    sourceCredit: 'Pexels photo 16089262',
    sourceUrl: 'https://images.pexels.com/photos/16089262/pexels-photo-16089262.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 68,
    ai_description: `### Title: Sculptural Threaded Afro Puffs with Wrapped Spokes

### Overview
A dramatic portrait of a traditional-inspired sculptural hairstyle made from wrapped sections that extend outward like spokes, each ending in a fluffy natural puff. The roots are neatly parted and the wrapped lengths rise away from the scalp, creating height, movement, and a striking crown shape. The natural puff ends show textured afro hair clearly, while the wrapped sections give the style its architectural identity. It is one of the most visually distinctive options in the batch.

### Styling Details
- Multiple wrapped sections extending outward from the crown
- Fluffy natural afro puffs at the end of each wrapped spoke
- Clean scalp partings and controlled root tension
- Natural black to dark brown coily texture at the puff ends
- Sculptural height and radial arrangement around the head
- Smooth wrapped bases suggesting African threading influence
- Highly intentional editorial/traditional styling with strong silhouette

### Ideal For
Oval, heart, and diamond face shapes. The height and radial shape create a bold ceremonial or editorial profile. Maintenance requires professional sectioning, secure wrapping, careful sleeping protection, and gentle moisturizing of the puff ends to prevent dryness.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B/4C',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'very-high',
      partingPattern: 'geometric',
      complexity: 'highly-intricate',
      requiresEdgeWork: true,
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
    console.error('No MONGO_URI found in environment');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB\n');

  const preTotal = await Hairstyle.countDocuments();
  console.log(`Production pre-count: ${preTotal}`);
  if (preTotal !== EXPECTED_PRE_COUNT) {
    console.error(`Pre-count mismatch. Expected ${EXPECTED_PRE_COUNT}, found ${preTotal}. Reconcile before seeding.`);
    await mongoose.disconnect();
    process.exit(2);
  }

  let created = 0;
  let skipped = 0;

  for (const style of newHairstyles) {
    console.log(`Processing: ${style.name} (${style.category}/${style.gender})`);
    console.log(`  Source: ${style.sourcePage}`);

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
    const publicId = `${slug}_${style.sourceId}`;

    const thumbnail = await uploadToCloudinary(style.sourceUrl, publicId);

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