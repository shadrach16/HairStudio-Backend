/**
 * Seed batch 3 — 10 premium hairstyles with clean, studio-quality images.
 * Run: node scripts/seedNewHairstyles3.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Hairstyle = require('../models/Hairstyle');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(imageUrl, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      imageUrl,
      {
        folder: 'Hairstyles',
        public_id: publicId,
        resource_type: 'image',
        transformation: [{ width: 600, height: 800, crop: 'fill', gravity: 'face', quality: 'auto' }],
      },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
  });
}

const newHairstyles = [
  // ─── 1. Knotless Box Braids (Braids) ─────────────────────────────────────
  {
    name: 'Knotless Box Braids (Medium, Waist Length)',
    category: 'Braids',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/10398045/pexels-photo-10398045.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 45,
    ai_description: `### Title: Knotless Box Braids (Medium, Waist Length)

---

### I. Style Foundation and Overall Structure
A stunning studio portrait of a Black woman with medium-sized knotless box braids extending to waist length. Unlike traditional box braids, knotless braids begin with a flat feed-in technique at the root — no visible knot at the base — creating a seamless, pain-free, and natural-looking start to each braid that sits flat against the scalp.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) at the base, with premium pre-stretched Kanekalon or X-pression braiding hair gradually fed in from the root. The feed-in start ensures zero tension at the hairline and scalp.

Product Use: Braiding gel or mousse for smooth, clean partings. Edge control for a sleek hairline. A lightweight braid spray with oil for sheen and to prevent frizzing of the braids.

### II. Arrangement and Placement
Clean, uniform box or diamond-shaped partings across the entire scalp. Each braid starts thin at the root (feed-in) and gradually thickens to its full diameter about 1-2 inches from the scalp, then maintains uniform thickness to the ends. The braids hang freely with a natural, weighty drape.

Braid Size: Medium (approximately 0.5-0.75 inch diameter)
Length: Extra-long (waist length)
Number of Braids: 60-90 total
Color: Natural black (#1B)
Root Appearance: Flat, seamless — no knot visible

### III. Technical Details
- Style Type: Knotless Box Braids (feed-in method)
- Installation: Feed-in technique — natural hair is braided first, then extension hair is gradually added
- Advantages over traditional: Less tension, no bumps at root, more natural appearance, less breakage
- Installation Time: 5-8 hours
- Maintenance: Low — moisturize scalp every 2-3 days, sleep with silk bonnet
- Longevity: 6-8 weeks
- Complexity: Moderate to intricate`,
    attributes: {
      hairType: 'braided',
      length: 'extra-long',
      stylingTechnique: 'feed-in-braid',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'intricate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // ─── 2. Butterfly Locs (Locs) ────────────────────────────────────────────
  {
    name: 'Butterfly Locs (Distressed Bohemian)',
    category: 'Locs',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/21602034/pexels-photo-21602034.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 38,
    ai_description: `### Title: Butterfly Locs (Distressed Bohemian)

---

### I. Style Foundation and Overall Structure
A fashion-forward portrait of a Black woman with butterfly locs — a trendy protective style that features distressed, messy faux locs achieved by wrapping crochet hair loosely around a base braid, then pulling loops out at intervals to create a textured, bohemian "butterfly" effect along each loc.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) braided into small cornrows or individual braids as a base. Water wave or passion twist crochet hair is wrapped around each braid using the butterfly/distressed wrapping technique.

Product Use: Mousse on the base braids for grip, hot water for dipping and sealing the locs after installation. A light oil sheen spray for the finished look. The intentionally messy, textured finish is the hallmark of this style.

### II. Arrangement and Placement
The locs are distributed across the head in medium-sized partings. Each loc features the signature "butterfly" texture — random loops and bumps pulled from the wrapping, giving an organic, lived-in appearance. The locs hang past the shoulders with varying degrees of distressing along their length.

Loc Size: Medium
Length: Long (past shoulders, approximately mid-back)
Texture: Deliberately distressed/messy with pulled loops
Color: Dark brown/black with possible warm highlights
Volume: Medium — individual locs are lightweight but collectively full

### III. Technical Details
- Style Type: Butterfly Locs / Distressed Faux Locs
- Installation: Crochet base braids + wrapping technique with loop pulls
- Creator: Popularized by stylist Erica Kay
- Maintenance: Very low — no daily restyling needed, gentle handling
- Longevity: 4-8 weeks
- Complexity: Moderate to intricate
- Trend Status: Major trend in protective styling since 2020`,
    attributes: {
      hairType: 'locked',
      length: 'long',
      stylingTechnique: 'crochet',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'intricate',
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // ─── 3. Cornrows with Beads & Accessories (Traditional) ──────────────────
  {
    name: 'Cornrows with Beads & Cowrie Shells',
    category: 'Traditional',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/11269030/pexels-photo-11269030.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 18,
    ai_description: `### Title: Cornrows with Beads & Cowrie Shells

---

### I. Style Foundation and Overall Structure
An artistic studio portrait of a Black woman with neatly braided cornrows adorned with decorative beads and cowrie shells. The combination of precise braiding with traditional African hair accessories creates a style that bridges heritage and contemporary fashion.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) tightly braided into cornrows against the scalp. The natural texture provides excellent grip for the braids and secure attachment points for accessories.

Product Use: A firm-hold braiding gel for clean, precise partings and smooth flat braids. Edge control for a polished hairline. The scalp may have a light oil applied for moisture.

### II. Arrangement and Placement
Straight-back cornrows run from the front hairline to the nape. The cornrows are evenly spaced and uniform in size. Decorative beads (wooden, metallic, or colored) and cowrie shells are threaded onto select braids or attached at intervals along the length, creating a rhythmic, decorative pattern.

Cornrow Pattern: Straight-back, parallel rows
Cornrow Size: Small to medium
Accessories: Beads (wooden/metallic), cowrie shells
Accessory Placement: At intervals along braids, or clustered at the ends
Color: Natural black with natural or colored accessories

### III. Technical Details
- Style Type: Cornrows with Traditional Accessories
- Cultural Origin: Pan-African — beads and cowrie shells have deep cultural significance across West, East, and Southern Africa
- Installation: Cornrow braiding + manual bead/shell threading
- Maintenance: Low — minimal daily care, accessories may need re-securing
- Longevity: 2-4 weeks
- Complexity: Moderate
- Cultural Significance: Cowrie shells historically symbolized wealth, fertility, and spiritual protection`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A-4C',
      length: 'medium',
      stylingTechnique: 'cornrow',
      volumeProfile: 'low',
      partingPattern: 'geometric',
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // ─── 4. Low Taper Fade with 360 Waves (Fades, male) ─────────────────────
  {
    name: 'Low Taper Fade with 360 Waves',
    category: 'Fades',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/7116213/pexels-photo-7116213.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 1,
    popularity: 35,
    ai_description: `### Title: Low Taper Fade with 360 Waves

---

### I. Style Foundation and Overall Structure
A clean, sharp portrait of a Black man with a low taper fade and meticulously brushed 360 waves on top. This is one of the most popular and timeless men's haircuts in Black barbershop culture — the waves are achieved through dedicated brushing, durag compression, and product application.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) at the top, trained into a 360 wave pattern through consistent brushing in a specific circular pattern. The tight coil pattern is ideal for wave formation.

Product Use: A wave pomade or moisturizer applied before brushing to create hold and definition. A durag or wave cap worn daily to compress and train the wave pattern. The fade area has aftershave balm for a clean, moisturized finish.

### II. Arrangement and Placement
The waves radiate outward from the crown in a 360-degree pattern, with consistent ripples visible across the top and sides before the fade begins. The low taper fades from full density at the temple line down to skin at the ear and nape, with a clean, sharp lineup at the forehead and temples.

Wave Pattern: 360 waves radiating from crown
Wave Depth: Well-defined, deep ripples
Fade Type: Low taper (gradual blend starting at temple level)
Lineup: Crisp, razor-sharp edge-up on forehead/temples
Nape: Tapered clean
Color: Natural black

### III. Technical Details
- Style Type: 360 Waves with Low Taper Fade
- Wave Method: Daily brushing (15-30 min), wave pomade, durag compression
- Cut: Low taper fade done with clippers (#1.5 to skin gradient)
- Maintenance: Very high — daily brushing, nightly durag, barber visits every 1-2 weeks
- Longevity: Ongoing maintenance style
- Complexity: Simple (cut) but discipline-intensive (wave training)
- Cultural Significance: 360 waves are a cornerstone of Black men's grooming culture`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A-4C',
      length: 'buzz',
      fadeType: 'taper',
      hasLineup: true,
      stylingTechnique: 'sculpted',
      volumeProfile: 'flat',
      partingPattern: 'none',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // ─── 5. Crochet Curls (Protective) ───────────────────────────────────────
  {
    name: 'Voluminous Crochet Curls Install',
    category: 'Protective',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/32767444/pexels-photo-32767444.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 27,
    ai_description: `### Title: Voluminous Crochet Curls Install

---

### I. Style Foundation and Overall Structure
A glamorous portrait of a Black woman with a voluminous crochet curls installation — bouncy, defined curls achieved by crocheting pre-curled synthetic or human hair extensions into cornrow braids underneath. The result is a full, natural-looking head of curly hair with incredible volume and body.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) braided into flat cornrows as a base. Pre-curled crochet hair (wand curl, ocean wave, or loose deep wave pattern) is looped through the cornrows using a crochet needle.

Product Use: A light mousse or curl refresher spray for maintaining curl definition and bounce. Anti-frizz serum for smoothness. The curls have a natural, touchable softness rather than a crunchy product feel.

### II. Arrangement and Placement
The crochet curls are distributed evenly across the head, with higher density at the crown and sides for maximum volume. A center or side part may be created. The curls are voluminous, bouncy, and frame the face with soft, cascading ringlets. The hairline is seamless, blending the crochet hair with laid edges.

Curl Pattern: Loose to medium spiral curls (wand curl or deep wave)
Length: Medium to long (past shoulders)
Volume: Very high — full, bouncy, dramatic
Color: Natural dark brown/black
Density: Dense — full coverage with no visible cornrow base

### III. Technical Details
- Style Type: Crochet Curls / Crochet Braids (curly variety)
- Installation: Cornrow base + crochet needle loop-through technique
- Hair Used: Pre-curled synthetic (Freetress, Outre) or human hair crochet packs
- Installation Time: 2-4 hours (fastest protective install)
- Maintenance: Low — fluff curls daily, moisturize with water/oil spray, sleep with bonnet
- Longevity: 4-8 weeks
- Complexity: Simple to moderate`,
    attributes: {
      hairType: 'curly',
      length: 'long',
      stylingTechnique: 'crochet',
      volumeProfile: 'very-high',
      partingPattern: 'center',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'protective-install',
    },
  },

  // ─── 6. Honey Blonde Bob (Bob) ───────────────────────────────────────────
  {
    name: 'Honey Blonde Layered Bob',
    category: 'Bob',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/13429681/pexels-photo-13429681.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 22,
    ai_description: `### Title: Honey Blonde Layered Bob

---

### I. Style Foundation and Overall Structure
A chic portrait of a Black woman with a honey blonde layered bob — a warm-toned, sun-kissed bob length hairstyle that showcases a rich honey blonde color against deeper brown-black roots. This can be a wig, closure install, or color-treated natural/relaxed hair.

Hair Texture: Straight to slightly wavy (human hair wig or color-treated natural hair). The layers create movement and dimension, while the honey blonde color adds warmth and radiance.

Product Use: A color-protecting gloss serum for vibrancy and shine, heat protectant for styling, and a lightweight finishing spray. The blonde color appears professionally applied with a seamless blend from darker roots to honey tips.

### II. Arrangement and Placement
The bob falls between chin and shoulder length with face-framing layers that add softness and movement. A side part or deep side part creates volume on one side. The ends may be slightly texturized or razor-cut for a lived-in, effortless feel. The color is a gradient from darker brown/black at the roots transitioning to warm honey blonde through the mid-lengths and ends.

Length: Short-medium (chin to shoulder)
Volume: Medium — body from layers and color dimension
Color: Honey blonde (#27) with dark root shadow
Movement: High — layers swing and bounce
Part: Side or deep side

### III. Technical Details
- Style Type: Honey Blonde Layered Bob
- Color Technique: Balayage, highlights, or full color with root shadow
- Installation: Lace-front wig, closure sew-in, or salon color service
- Maintenance: Medium-high — color maintenance every 4-6 weeks, purple shampoo for tone
- Longevity: Ongoing with touch-ups
- Complexity: Moderate
- Best For: Warm skin undertones, those wanting a bold color transformation`,
    attributes: {
      hairType: 'straight',
      length: 'short',
      stylingTechnique: 'flat-iron',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'moderate',
      baseColor: 'honey-blonde',
      hasColorTreatment: true,
      colorNotes: 'Honey blonde (#27) with dark root shadow/balayage',
      promptFamily: 'standard',
    },
  },

  // ─── 7. Senegalese Twists (Twists) ───────────────────────────────────────
  {
    name: 'Long Senegalese Rope Twists',
    category: 'Twists',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/14037647/pexels-photo-14037647.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 23,
    ai_description: `### Title: Long Senegalese Rope Twists

---

### I. Style Foundation and Overall Structure
An elegant portrait of a Black woman with long Senegalese twists — sleek, rope-like two-strand twists made with smooth synthetic Kanekalon braiding hair, creating a polished, refined protective style distinct from the chunkier, textured Marley or Havana twists.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) at the base, with smooth Kanekalon synthetic hair twisted tightly to create a glossy, rope-like finish. The smooth texture of Kanekalon gives Senegalese twists their signature sleek appearance.

Product Use: Braiding gel for clean partings, edge control for the hairline. Hot water dipping to seal the twist ends and prevent unraveling. A light oil sheen spray for the finished look.

### II. Arrangement and Placement
The twists are parted in small to medium box or triangular sections and twisted from root to tip. The tight, consistent twisting creates smooth, rope-like cords that hang with elegant weight. The twists are long, extending past the shoulders to mid-back or waist.

Twist Size: Small to medium (rope-like, not bulky)
Length: Long to extra-long (mid-back to waist)
Texture: Smooth, glossy, sleek — not textured or matte
Color: Natural black (#1B) or dark brown (#2)
Volume: Low to medium — sleek and streamlined

### III. Technical Details
- Style Type: Senegalese Twists / Rope Twists
- Hair Used: Kanekalon braiding hair (smooth texture)
- Installation: Two-strand twist, tight and consistent, with extensions
- Sealing: Hot water dip for ends
- Installation Time: 5-8 hours
- Maintenance: Low — light oil on scalp, sleep with bonnet
- Longevity: 6-10 weeks
- Complexity: Moderate
- Comparison: Smoother and sleeker than Marley twists, which use kinky-textured hair`,
    attributes: {
      hairType: 'twisted',
      length: 'extra-long',
      stylingTechnique: 'other',
      volumeProfile: 'low',
      partingPattern: 'geometric',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // ─── 8. Buzz Cut with Design (Modern, male) ─────────────────────────────
  {
    name: 'Precision Buzz Cut (Clean Crop)',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/8499387/pexels-photo-8499387.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 1,
    popularity: 19,
    ai_description: `### Title: Precision Buzz Cut (Clean Crop)

---

### I. Style Foundation and Overall Structure
A sharp, clean studio portrait of a Black man with a precision buzz cut — an ultra-short, all-over clipper cut that maintains a uniform length across the entire head. The style is defined by its simplicity, cleanliness, and the sharp edge-up/lineup that frames the face.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) cut to a very short, uniform length using clippers (typically a #1 or #1.5 guard). The coily texture creates a soft, velvety appearance at this short length.

Product Use: Minimal — aftershave balm on the edges for a clean finish, a light moisturizer or oil on the scalp for health and subtle sheen. No styling products needed.

### II. Arrangement and Placement
The hair is uniformly short across the top, sides, and back. The defining feature is the precision lineup — a razor-sharp edge-up along the forehead, temples, and sideburns that creates a clean architectural frame for the face. The nape is squared off or rounded per preference.

Length: Buzz (1-3mm uniform)
Lineup: Ultra-crisp, razor-defined edges
Shape: Follows natural head contour
Color: Natural black
Volume: Flat — sits close to the scalp

### III. Technical Details
- Style Type: Precision Buzz Cut / Caesar Crop
- Cut Method: Clippers with guard (#1 or #1.5), straight razor for lineup
- Maintenance: Medium — barber visits every 1-2 weeks to maintain lineup sharpness
- Longevity: 1-2 weeks between cuts
- Complexity: Simple
- Versatility: Professional, athletic, low-maintenance, timeless
- Best For: Strong facial features, athletic lifestyle, professional settings`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A-4C',
      length: 'buzz',
      fadeType: 'none',
      hasLineup: true,
      stylingTechnique: 'sculpted',
      volumeProfile: 'flat',
      partingPattern: 'none',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // ─── 9. Waist-Length Faux Locs (Fashion) ─────────────────────────────────
  {
    name: 'Waist-Length Goddess Faux Locs',
    category: 'Fashion',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/14686936/pexels-photo-14686936.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 33,
    ai_description: `### Title: Waist-Length Goddess Faux Locs

---

### I. Style Foundation and Overall Structure
A dramatic fashion portrait of a Black woman with ultra-long, waist-length faux locs — a statement-making protective style where synthetic loc extensions create the appearance of mature dreadlocks without the actual locking process. The extreme length creates a powerful, eye-catching silhouette.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) braided into a cornrow or individual braid base. Faux loc hair (pre-looped or wrapped) is attached using the crochet or wrapping method. The loc texture varies from smooth to slightly distressed.

Product Use: A loc moisturizer spray for sheen and softness, hot water for setting the locs after installation, and a light edge control for the hairline.

### II. Arrangement and Placement
The locs are distributed across the entire head in uniform medium-sized sections. They hang freely with dramatic length, extending from the scalp to at or below the waist. The front locs frame the face and can be styled — swept to one side, half-up, or adorned with accessories. The sheer volume of hair at this length creates a regal, commanding presence.

Loc Size: Medium
Length: Extra-long (waist length — 24-30 inches)
Weight: Noticeable — the length creates a weighted, flowing drape
Texture: Smooth to slightly distressed faux loc texture
Color: Natural black or dark brown

### III. Technical Details
- Style Type: Waist-Length Faux Locs / Goddess Locs
- Installation: Crochet or wrapping method with pre-made faux loc extensions
- Installation Time: 6-10 hours (due to extreme length)
- Maintenance: Low — moisturize, sleep with bonnet, gentle handling of the length
- Longevity: 6-8 weeks
- Complexity: Intricate (length adds difficulty)
- Weight Consideration: Extended length may cause tension — ensure base braids are not too tight`,
    attributes: {
      hairType: 'locked',
      length: 'extra-long',
      stylingTechnique: 'faux-loc',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'highly-intricate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // ─── 10. Finger Waves (Relaxed) ──────────────────────────────────────────
  {
    name: 'Classic Finger Waves (Retro Glam)',
    category: 'Relaxed',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/34791586/pexels-photo-34791586.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 16,
    ai_description: `### Title: Classic Finger Waves (Retro Glam)

---

### I. Style Foundation and Overall Structure
A glamorous portrait of a Black woman with classic finger waves — a precision-molded hairstyle where the hair is sculpted into S-shaped waves lying flat against the scalp using fingers, a comb, and setting gel. This iconic style references 1920s-1940s Hollywood glamour and remains a staple in formal and fashion styling.

Hair Texture: Relaxed, pressed, or naturally straight/wavy hair that can be molded flat against the scalp. The hair must be smooth enough to hold the wave pattern. Can also be achieved on short natural hair with strong-hold gel.

Product Use: A strong-hold setting gel or wave set lotion is essential — applied generously to wet hair before molding. The waves are finger-sculpted and comb-directed into place, then dried under a hooded dryer or air-dried. A high-shine finishing spray completes the look.

### II. Arrangement and Placement
The waves follow a precise S-curve pattern from the hairline throughout the head. They can run from front to back, side to side, or radiate from a part. Each wave ridge is clean, sharp, and equidistant from the next. The sheen level is very high — almost lacquered — which is characteristic of the style.

Wave Pattern: S-shaped curves, uniform and symmetrical
Direction: Front-to-back or radiating from side part
Depth: Shallow — waves lie flat against the scalp
Finish: High-gloss, wet-look sheen
Color: Natural black or jet black

### III. Technical Details
- Style Type: Finger Waves (classic/retro)
- Era Origin: 1920s-1940s Hollywood, Harlem Renaissance
- Method: Wet-set with fingers and comb, strong-hold gel, dried under hooded dryer
- Maintenance: Very low once set — will last 1-2 weeks if wrapped at night
- Longevity: 1-2 weeks with protection
- Complexity: Intricate (requires skill and patience)
- Best For: Formal events, editorial shoots, retro-themed occasions, red carpet
- Cultural Significance: Finger waves have deep roots in Black beauty culture and continue to be featured in high fashion`,
    attributes: {
      hairType: 'wavy',
      length: 'short',
      stylingTechnique: 'sculpted',
      volumeProfile: 'flat',
      partingPattern: 'side-left',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },
];

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  let created = 0;
  let skipped = 0;

  for (const style of newHairstyles) {
    const exists = await Hairstyle.findOne({ name: style.name });
    if (exists) {
      console.log(`⏭  SKIP (exists): ${style.name}`);
      skipped++;
      continue;
    }

    const slug = style.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
    console.log(`📤 Uploading: ${style.name}...`);

    let thumbnailUrl;
    try {
      thumbnailUrl = await uploadToCloudinary(style.sourceUrl, slug);
    } catch (err) {
      console.error(`  ❌ Upload failed for ${style.name}:`, err.message);
      continue;
    }

    const thumbUrl = thumbnailUrl.replace('/upload/', '/upload/c_thumb,w_200,g_face/');

    const doc = new Hairstyle({
      name: style.name,
      category: style.category,
      gender: style.gender,
      thumbnail: thumbUrl,
      ai_description: style.ai_description,
      attributes: style.attributes,
      price: style.price,
      popularity: style.popularity,
      isActive: true,
      isCustom: false,
    });

    await doc.save();
    console.log(`  ✅ ${style.name} → ${style.category} | ${style.gender} | ${style.price}cr | pop:${style.popularity}`);
    created++;
  }

  console.log(`\n─── Done ───`);
  console.log(`Created: ${created} | Skipped: ${skipped} | Total in DB: ${await Hairstyle.countDocuments()}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
