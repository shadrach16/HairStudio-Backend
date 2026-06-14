/**
 * Batch 16 Seed Script — 10 new NON-AFRICAN hairstyles
 * DB before: ~239 total | Target after: ~249
 *
 * Category targets (filling under-represented):
 *   Straight/male    |  Relaxed/male     |  Traditional/female
 *   Fashion/female   |  Bob/male         |  Fades/female
 *   Low Cut/male     |  Straight/female  |  Modern/male
 *   Relaxed/female
 *
 * Sources: All Pexels (free license)
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

  // 1 — Straight/male
  {
    name: 'Refined Suit-and-Tie Side Part with Natural Sheen',
    category: 'Straight',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/11395986/pexels-photo-11395986.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 64,
    ai_description: `### Title: Refined Suit-and-Tie Side Part with Natural Sheen

### Overview
A polished, editorial-grade portrait of a man in formal attire with an impeccably styled side-parted hairstyle. The dark hair is neatly combed from a defined left-side part, sweeping to the right with controlled precision. The hair has a natural, healthy sheen — not overly gelled or wet-looking — with a smooth surface that catches studio lighting beautifully. The length on top is approximately 3-4 inches, gradually tapering to shorter, neatly trimmed sides. A formal black suit jacket with white shirt creates a sharp, professional backdrop for the clean hairstyle. The overall effect is corporate polish meeting classic gentlemen's grooming — the kind of cut that communicates authority and refinement.

### Styling Details
- Dark brown to black hair with a defined left-side part
- Smooth, swept-right top with controlled volume
- Natural sheen finish from a light pomade or styling cream
- Approximately 3-4 inches on top, shorter tapered sides
- Clean ear exposure with neatly trimmed sideburns
- No hard part — the parting is natural and styled, not razored
- Minimal flyaways with a polished, formal finish
- Precise hairline at temples and nape
- Volumetric profile sits close to the head — not puffed up

### Ideal For
All face shapes, particularly square and oval. The side part creates a classic asymmetry that works universally in professional settings. An essential boardroom hairstyle for men who value traditional grooming with modern execution. Extremely low maintenance once styled — comb, part, apply light product, done.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'low',
      partingPattern: 'side-left',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 2 — Traditional/female
  {
    name: 'Natural Copper Waves with Daisy Crown',
    category: 'Traditional',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/2128808/pexels-photo-2128808.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 66,
    ai_description: `### Title: Natural Copper Waves with Daisy Crown

### Overview
A radiant close-up portrait of a woman with stunning natural copper-red hair that glows with warmth and vitality. The hair cascades in loose, natural waves past the shoulders with rich auburn and copper tones that catch the light magnificently. The color is a true natural redhead — warm, deep, and multi-tonal with lighter copper strands blending into richer auburn undertones. A soft center part allows the waves to frame the face symmetrically, with wispy pieces framing the forehead. The texture is naturally wavy with a healthy, glossy finish that suggests excellent hair condition. The subject smiles warmly, with freckles visible, reinforcing the natural, sun-kissed beauty aesthetic.

### Styling Details
- Long flowing waves extending past the shoulders
- Natural copper-red color with rich auburn and warm copper tonal variations
- Soft center parting with natural, unfussy part line
- Loose, natural wave pattern — not curled, born this way
- Face-framing wispy pieces around the forehead and temples
- Healthy, glossy finish with natural sheen throughout
- Volume evenly distributed from roots to ends
- Minimal styling — this is a wash-and-go natural beauty look
- No bangs — open forehead with curtain-like fall on both sides

### Ideal For
Oval, heart, and round face shapes. The loose waves and center part create a beautiful, balanced frame. Absolutely stunning on natural redheads or anyone with warm skin tones seeking a red color. Low maintenance — let the natural texture do its thing with a light anti-frizz serum.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'auburn',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 3 — Fashion/female
  {
    name: 'Vivid Ginger Curly Bob with Studio Drama',
    category: 'Fashion',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/12148956/pexels-photo-12148956.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 60,
    ai_description: `### Title: Vivid Ginger Curly Bob with Studio Drama

### Overview
A striking studio portrait featuring a woman with vivid red-ginger curly hair in a bold bob cut. The curls are tight, defined, and full of life — bouncy ringlets that frame the face with electric energy. The color is a vivid, saturated red-ginger — deeper at the roots and more intensely copper at the mid-lengths and ends. The bob length falls just at the jawline, with curls adding volume that extends the silhouette outward. The styling is deliberate and fashion-forward — the curls are intentionally voluminous, creating a halo effect around the face. The subject wears a simple black top against a studio setting, ensuring the dramatic red curls are the undisputed focal point.

### Styling Details
- Chin-length curly bob with tight, defined ringlets
- Vivid red-ginger color — saturated copper tones throughout
- Slightly deeper root zone transitioning to brighter copper ends
- Type 3B tight ringlet curl pattern with incredible definition
- Voluminous silhouette — curls add width and drama
- No visible part — curls fall naturally in all directions
- Healthy, hydrated curls with visible shine and bounce
- Styled with curl cream for definition and hold
- No frizz — each curl is well-defined and separated
- Fashion-forward aesthetic — bold, artistic, statement-making

### Ideal For
Square, rectangular, and oval face shapes. The voluminous curly bob adds softness to angular faces and creates beautiful width at the jawline. A daring, editorial look for women who love to make a statement with color and texture. Medium-high maintenance — vivid color requires regular refresh and curls need consistent moisture.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3B',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'free-form',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'red',
      hasColorTreatment: true,
      colorNotes: 'Vivid red-ginger with saturated copper tones',
      promptFamily: 'standard',
    },
  },

  // 4 — Modern/male
  {
    name: 'South Asian Flow with Beard and Tank Top',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/4148671/pexels-photo-4148671.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 62,
    ai_description: `### Title: South Asian Flow with Beard and Tank Top

### Overview
A contemplative close-up portrait of a man with long, flowing dark hair and a full groomed beard. The jet-black hair is thick and naturally straight with slight body, falling past the shoulders in a free-flowing manner. No product is visible — the hair moves naturally and appears freshly washed with a healthy, matte finish. The beard is full and well-maintained, trimmed to a medium length with clean cheek lines. The overall look is modern and masculine — long hair paired with a groomed beard creates an interesting contrast between free-spirited and refined. The subject wears a simple gray tank top against a warm, neutral background, keeping the focus on the striking hair-and-beard combination.

### Styling Details
- Long, flowing jet-black hair extending past the shoulders
- Natural straight to slightly wavy texture
- Matte, healthy finish with no visible product
- Free-flowing with no part — hair pushed back naturally
- Full, groomed beard at medium length with clean lines
- No coloring or highlights — pure natural black
- Volume naturally distributed with slight flattening at the crown
- Hair drapes over both sides of the face for framing
- Ears partially covered by flowing strands
- Natural, low-effort aesthetic that looks effortlessly cool

### Ideal For
All face shapes, especially round and square. Long hair creates a lengthening effect while the beard adds jaw definition. A modern, masculine look that bridges traditional and contemporary style. Very low maintenance — wash, condition, let it air dry. The key is hair health and regular beard grooming.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'long',
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
      promptFamily: 'standard',
    },
  },

  // 5 — Fades/female
  {
    name: 'Fiery Freckled Crop with Side-Swept Fringe',
    category: 'Fades',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/20334528/pexels-photo-20334528.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 59,
    ai_description: `### Title: Fiery Freckled Crop with Side-Swept Fringe

### Overview
A vibrant, captivating close-up portrait of a woman with a striking short cropped hairstyle in a vivid red shade. The hair is cut short — almost a textured crop — with longer pieces on top that are swept dramatically to one side across the forehead. The color is a bold, saturated red with orange undertones — vivid and eye-catching against the subject's freckled skin. The sides are tapered short, almost to a skin-fade level near the temples, while the top retains enough length for directional styling. The fringe sweeps across the forehead with a piecey, textured quality. Photographed in natural light, the subject's freckles and expressive features are beautifully highlighted, creating a portrait where the bold hair color and distinctive features work in harmony.

### Styling Details
- Short textured crop with longer top swept to one side
- Vivid red color with warm orange undertones throughout
- Sides tapered short — close to a low taper near temples
- Fringe approximately 2-3 inches, swept dramatically sideways
- Piecey, textured finish on the fringe with visible strand separation
- Matte styling product for texture and directional hold
- Clean temple and ear outline
- No hard part — the direction is styled rather than razored
- Bold fashion color on naturally lighter base hair
- Intentionally disheveled, edgy finish

### Ideal For
Oval, heart, and diamond face shapes. The side-swept fringe creates asymmetry that flatters most faces while the short sides add structure. A bold, confident style for women who embrace short hair as a fashion statement. Medium maintenance — color needs regular touch-ups, but daily styling is quick.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'buzz',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'low',
      partingPattern: 'side-left',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'red',
      hasColorTreatment: true,
      colorNotes: 'Vivid red with warm orange undertones',
      promptFamily: 'low-cut',
    },
  },

  // 6 — Relaxed/female
  {
    name: 'Elegant Long Curls with Dark Studio Backdrop',
    category: 'Relaxed',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/36728888/pexels-photo-36728888.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 63,
    ai_description: `### Title: Elegant Long Curls with Dark Studio Backdrop

### Overview
An elegant studio portrait of a young woman with beautiful long curly hair against a dark backdrop. The dark brown curls cascade past the shoulders in soft, defined ringlets with incredible shine and movement. The hair is parted naturally off-center with voluminous curls framing the face on both sides. The curl pattern is consistent and well-maintained — each curl is defined and separated without looking crunchy or over-styled. The color is a rich, warm dark brown with subtle natural highlights that catch the studio lighting. The overall aesthetic is polished yet natural — editorial-quality curls that look like they were born, not made. The dark background creates dramatic contrast that highlights the texture and dimension of each individual curl.

### Styling Details
- Long curly hair extending well past the shoulders
- Rich dark brown with warm natural highlights
- Soft, defined ringlet curl pattern — Type 2C to 3A
- Natural off-center parting with face-framing curls
- Incredible shine and healthy appearance throughout
- Consistent curl definition from roots to ends
- Volume concentrated at mid-lengths for a cascading effect
- Styled with curl-enhancing cream or leave-in conditioner
- No frizz — hydrated, well-conditioned curls
- Relaxed, natural finish — not over-manipulated

### Ideal For
All face shapes, especially square and rectangular. The soft, voluminous curls add warmth and femininity to angular features. A timeless, universally flattering style that celebrates natural curl texture. Medium maintenance — requires regular deep conditioning and curl-specific products for best definition.`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'side-left',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 7 — Low Cut/male
  {
    name: 'Fresh Barbershop Crop with Precise Temple Lines',
    category: 'Low Cut',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/6487911/pexels-photo-6487911.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 67,
    ai_description: `### Title: Fresh Barbershop Crop with Precise Temple Lines

### Overview
A clean, detailed close-up from behind showing a freshly executed men's crop haircut with impeccable precision. The hair is dark brown and cut very short all around — approximately a #3 to #4 guard on the sides with slightly more length on top. The standout feature is the precision of the temple lines and neckline — each edge is razor-sharp, demonstrating expert barbershop craftsmanship. The transition from the slightly longer top to the shorter sides is seamless and blended. The texture on top shows natural, fine hair with a soft, uniform appearance. The neckline is squared off cleanly with no visible stray hairs. This is a minimalist, no-nonsense haircut photographed from the ideal angle to showcase the technical skill of the barber.

### Styling Details
- Very short all-over crop — approximately 10-15mm on top, shorter on sides
- Dark brown natural color with no coloring
- Seamless blend from top to sides — no visible line of demarcation
- Razor-sharp temple lines and neckline
- Squared neckline with clean edges
- Fine, natural texture on top — no product needed
- Ears fully exposed with precise outline trimming
- Skin not visible through the hair — not a skin fade, but very short
- Matte, natural finish — no product applied
- Clean, professional barbershop execution

### Ideal For
All face shapes. The short crop is universally flattering and emphasizes facial features rather than the hair. Especially good for men with strong jawlines and defined features. The most low-maintenance cut possible — wash and go, with barbershop visits every 2-3 weeks to maintain the sharp edges.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'buzz',
      fadeType: 'taper',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: true,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // 8 — Straight/female
  {
    name: 'Voluminous Brunette Curls with Confident Pose',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/21134319/pexels-photo-21134319.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 65,
    ai_description: `### Title: Voluminous Brunette Curls with Confident Pose

### Overview
A stunning studio portrait of a woman with luxuriously voluminous dark brunette hair. The hair is thick, shiny, and falls in soft, bouncy waves past the shoulders with impressive body and movement. The color is a rich, warm dark brunette — deep chocolate tones with subtle lighter threads at the mid-lengths where light catches. The styling is blow-dried to perfection with a large round brush, creating cascading waves that have incredible volume at the roots and beautiful bounce at the ends. The hair is parted slightly off-center with layers that frame the face. The overall look is salon-fresh and editorial — the kind of hair featured in luxury beauty campaigns. The controlled volume creates a glamorous, full silhouette.

### Styling Details
- Long, voluminous dark brunette hair past the shoulders
- Rich chocolate-brown color with warm natural tones
- Blow-dried with a round brush for volume and bounce
- Soft, cascading waves — not curled, achieved through blow-drying technique
- Off-center part with face-framing layers
- Impressive root volume for a full, lifted silhouette
- Healthy, glossy finish with light-catching shine
- Ends curled slightly inward for a polished look
- Volume concentrated at roots and mid-lengths
- No frizz or split ends — salon-perfect condition

### Ideal For
All face shapes. Voluminous waves are universally flattering and add a glamorous dimension to any look. Particularly beautiful on oval and heart shapes. A red-carpet-ready style that elevates any outfit from casual to formal. Medium-high maintenance — requires blow-dry time and styling, but the result is worth it.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'side-left',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 9 — Bob/male
  {
    name: 'Pensive Blonde Coat Flow with Side Fall',
    category: 'Bob',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/4651502/pexels-photo-4651502.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 58,
    ai_description: `### Title: Pensive Blonde Coat Flow with Side Fall

### Overview
A moody, fashion-forward portrait of a young man with a chin-length blonde bob hairstyle. The hair is light blonde — a cool, ashy tone — and falls in soft, natural layers to just past the jawline. The styling is relaxed and intentionally undone — pieces fall across the forehead and around the face in a casual, wind-swept manner. The hair has a natural, slightly wavy texture with a matte finish — no visible product or heavy styling. The man wears a warm beige coat, and his pensive, side-gazing expression combined with the soft blonde hair creates a cinematic, editorial mood. This is a unisex bob style adapted for masculine presentation — relaxed, effortless, and fashion-conscious.

### Styling Details
- Chin-length bob with soft, natural layering
- Cool, ashy blonde color — platinum-adjacent but warm enough to feel natural
- Relaxed, wind-swept styling with pieces falling across forehead
- Natural matte finish — no visible product
- Slight natural wave at the ends
- No defined part — hair falls naturally from center to off-center
- Face-framing pieces on both sides of the jaw
- Ears partially covered for a soft, flowing silhouette
- Slightly longer in the front than the back — classic bob angle
- Intentionally undone, fashion-editorial aesthetic

### Ideal For
Oval, rectangular, and diamond face shapes. The chin-length bob frames the jawline and adds softness to angular features. A bold, modern choice for men who appreciate fashion-forward hairstyles. Low maintenance in daily styling — let it air dry and fall naturally — but requires regular trims to maintain the shape.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'blonde',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 10 — Traditional/male
  {
    name: 'Classic Barbershop Gentleman with Yellow Polo',
    category: 'Traditional',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/30782416/pexels-photo-30782416.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 61,
    ai_description: `### Title: Classic Barbershop Gentleman with Yellow Polo

### Overview
A warm, profile portrait of a bearded man showcasing a classic gentleman's barbershop hairstyle. The dark hair is neatly trimmed and styled with a clean side part and a natural taper at the sides. The top is swept back and slightly to the side with medium hold, creating a rounded, polished silhouette. The beard is full but meticulously groomed — trimmed to a uniform length with clean cheek and necklines. The combination of the precisely styled hair and groomed beard speaks to regular barbershop visits and pride in personal grooming. The subject wears a bright yellow polo shirt that creates a warm, vibrant contrast against the dark hair and beard. Photographed indoors with soft natural light, the portrait captures the approachable side of classic masculine grooming.

### Styling Details
- Dark brown to black hair with a natural side part
- Top swept back and slightly to the right with medium hold
- Natural taper at the sides — scissor-cut, not clippered
- Approximately 2-3 inches on top, shorter on the sides
- Full, groomed beard at uniform medium length
- Clean cheek lines and neckline on the beard
- Semi-matte finish from a light styling cream or pomade
- Clean ear exposure with neat sideburn-to-beard transition
- Rounded, polished profile silhouette
- Classic barbershop craftsmanship evident throughout

### Ideal For
All face shapes. The combination of side-parted hair and groomed beard creates a balanced, masculine frame that works universally. Especially flattering on round and oval faces where the structured styling adds definition. A timeless gentleman's look suitable for professional, social, and casual settings. Regular barbershop maintenance every 2-3 weeks.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'short',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
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
  console.error('Fatal error:', err);
  process.exit(1);
});
