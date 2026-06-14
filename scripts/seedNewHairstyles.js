/**
 * Seed 10 new hairstyles — downloads from Pexels, uploads to Cloudinary, inserts into MongoDB.
 * Run: node scripts/seedNewHairstyles.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const https = require('https');
const Hairstyle = require('../models/Hairstyle');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Upload a remote URL to Cloudinary ──────────────────────────────────────
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
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
  });
}

// ─── The 10 new hairstyles ──────────────────────────────────────────────────
const newHairstyles = [
  {
    name: 'Goddess Locs with Golden Highlights',
    category: 'Protective',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/15234303/pexels-photo-15234303.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 12,
    ai_description: `### Title: Goddess Locs with Golden Highlights

---

### I. Style Foundation and Overall Structure
A professional portrait of a Black woman with long, flowing Goddess Locs cascading past her shoulders. The locs are a protective style featuring distressed faux locs with loose, wavy hair wrapped around each loc for a bohemian, goddess-like appearance.

Hair Texture: The base hair is natural coily/kinky (4B-4C), with synthetic or human hair extensions used to create the goddess loc effect. The wrapping technique creates a soft, romantic texture that contrasts with traditional locs.

Product Use: A light oil sheen is visible, suggesting the use of loc moisturizing spray and a lightweight oil to maintain luster and prevent dryness.

### II. Arrangement and Placement
The locs are center-parted and fall naturally on both sides. They are uniform in thickness (medium-sized) and hang freely past the collarbone. The front sections frame the face elegantly, with some locs tucked behind the ears for a polished look.

Length: Extra-long (past shoulders, approaching mid-back)
Volume: Medium-high, with the bulk concentrated in the mid-lengths
Color: Dark brown base with subtle golden/honey blonde highlights woven through select locs

### III. Technical Details
- Style Type: Goddess Locs (faux loc variation with loose curly wraps)
- Installation Method: Crochet or wrap method
- Maintenance: Low — requires moisturizing every 2-3 days, sleeping with a silk bonnet
- Longevity: 4-8 weeks
- Complexity: Moderate to intricate`,
    attributes: {
      hairType: 'locked',
      length: 'extra-long',
      stylingTechnique: 'faux-loc',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'intricate',
      baseColor: 'dark-brown',
      hasColorTreatment: true,
      colorNotes: 'Golden/honey blonde highlights on select locs',
      promptFamily: 'locs',
    },
  },
  {
    name: 'Defined Twist Out on Medium Natural Hair',
    category: 'Twists',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/1958733/pexels-photo-1958733.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 18,
    ai_description: `### Title: Defined Twist Out on Medium Natural Hair

---

### I. Style Foundation and Overall Structure
A striking portrait of a Black woman with a beautifully defined twist out on medium-length natural hair. The two-strand twists were unraveled to reveal voluminous, defined spiral curls with excellent separation and minimal frizz.

Hair Texture: Natural coily/kinky hair (Type 4A-4B) that has been stretched and defined via the twist-out technique. The curls display spring and bounce, indicating healthy, well-moisturized hair.

Product Use: Curl defining cream or custard applied before twisting, with a light oil sealant for sheen. The definition suggests a combination of leave-in conditioner, styling gel, and oil for the LOC/LCO method.

### II. Arrangement and Placement
The twist out creates a full, rounded silhouette that frames the face symmetrically. No visible parting — the curls are fluffed and separated for maximum volume. The curls are directed outward and upward from the crown, creating height and width.

Length: Medium (chin to shoulder length when stretched)
Volume: High — maximum volume achieved through fluffing at the roots
Color: Natural black with warm undertones visible in light

### III. Technical Details
- Style Type: Twist Out (two-strand twist unraveled)
- Setting Method: Air-dried or diffused on low heat
- Maintenance: Medium — requires nightly pineapple or bonnet, refreshing with water/oil mix
- Longevity: 3-7 days before re-twisting needed
- Complexity: Simple to moderate`,
    attributes: {
      hairType: 'twisted',
      hairTexture: '4A-4B',
      length: 'medium',
      stylingTechnique: 'twist-out',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },
  {
    name: 'Elegant Flat Twist Updo',
    category: 'Protective',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/36601962/pexels-photo-36601962.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 8,
    ai_description: `### Title: Elegant Flat Twist Updo

---

### I. Style Foundation and Overall Structure
A refined portrait of a Black woman wearing an elegant flat twist updo — a sophisticated protective style where flat twists are arranged into an upswept formation, pinned and secured at the crown or back of the head.

Hair Texture: Natural coily/kinky hair (Type 4B-4C) that has been neatly flat-twisted close to the scalp and gathered into an updo. The technique requires skillful tension control and clean partings.

Product Use: Edge control or styling gel for sleek edges, a moisturizing butter for the twists, and possibly a light-hold hairspray for finishing. The edges appear laid and smooth.

### II. Arrangement and Placement
The flat twists originate from the hairline and are directed upward and toward the crown, where they are gathered, coiled, and pinned into a bun or sculptural updo formation. The edges along the forehead and temples are smoothly laid. The updo creates an elongated silhouette that accentuates the neck and jawline.

Length: Medium to long (tucked into updo)
Volume: Low to medium — sleek and close to the head
Color: Natural black

### III. Technical Details
- Style Type: Flat Twist Updo (protective style)
- Installation Method: Hand-twisted flat twists pinned into an updo
- Maintenance: Low — wrap with silk scarf at night, moisturize edges daily
- Longevity: 1-2 weeks
- Complexity: Moderate to intricate
- Occasion: Formal events, weddings, professional settings`,
    attributes: {
      hairType: 'twisted',
      hairTexture: '4B-4C',
      length: 'medium',
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
  {
    name: 'Bantu Knots Crown Style',
    category: 'Traditional',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/5541444/pexels-photo-5541444.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 15,
    ai_description: `### Title: Bantu Knots Crown Style

---

### I. Style Foundation and Overall Structure
A vibrant portrait of a Black woman with a full set of Bantu Knots — small, coiled buns created by twisting sections of hair and wrapping them around themselves to form knot-like structures across the entire head. This is both a standalone style and a setting method for a Bantu knot-out.

Hair Texture: Natural coily/kinky hair (Type 4B-4C), with sufficient length and density to form well-defined, secure knots. The hair's natural coily texture provides excellent grip for the knots to hold without excessive product.

Product Use: A styling cream or butter to soften the hair before twisting, possibly a light gel at the base of each knot for security. Minimal product visible — the focus is on the structural beauty of the knots.

### II. Arrangement and Placement
The Bantu knots are distributed evenly across the entire scalp in a symmetrical grid or brick-lay pattern. Each knot is approximately the same size (small to medium), creating a uniform, crown-like appearance. The partings between knots are clean and precise.

Number of Knots: Approximately 15-25 across the full head
Size: Small to medium — uniform sizing
Pattern: Symmetrical grid or offset brick-lay pattern
Color: Natural black

### III. Technical Details
- Style Type: Bantu Knots (Zulu Knots)
- Cultural Origin: Zulu people of Southern Africa
- Installation Method: Section, two-strand twist, coil into knot, tuck end
- Maintenance: Low — can be moisturized with a spray; sleep with silk scarf
- Longevity: 1-2 weeks as knots, or unravel after 1 day for Bantu knot-out curls
- Complexity: Simple to moderate`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B-4C',
      length: 'medium',
      stylingTechnique: 'twist-out',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },
  {
    name: 'Classic High Top Fade',
    category: 'Fades',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/17086220/pexels-photo-17086220.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 22,
    ai_description: `### Title: Classic High Top Fade

---

### I. Style Foundation and Overall Structure
A sharp portrait of a Black man with a Classic High Top Fade — an iconic haircut where the sides and back are faded very short (skin fade or close clipper cut) while the top is left significantly longer and shaped into a flat or rounded vertical silhouette.

Hair Texture: Natural coily/kinky hair (Type 4B-4C) at the top, which provides the density and structure needed to maintain the vertical high-top shape. The natural coil pattern acts as a natural scaffolding.

Product Use: A strong-hold styling sponge or pick was used to define the coils at the top. Minimal product visible — possibly a light oil for sheen and a balm on the faded sides for a clean, moisturized finish.

### II. Arrangement and Placement
The fade begins at the temples and ears, transitioning from skin (0 guard) through a mid-fade graduation to the full-length top. The top hair stands vertically, shaped into a flat-top or slightly rounded high-top silhouette. The front edge is squared off or slightly rounded, and the lineup at the forehead and temples is crisp and precise.

Fade Type: High skin fade
Top Length: 3-5 inches (standing upright)
Shape: Squared/flat-top or rounded high-top
Lineup: Crisp, precise edge-up across forehead and temples
Color: Natural black

### III. Technical Details
- Style Type: High Top Fade (Kid 'n Play / Flat Top variation)
- Cut Method: Clippers for fade, pick/sponge for top texture
- Maintenance: High — requires barber visits every 1-2 weeks for fade upkeep
- Longevity: 1-2 weeks between cuts
- Complexity: Moderate (requires skilled barber for clean blend)`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B-4C',
      length: 'short',
      fadeType: 'high-fade',
      hasLineup: true,
      stylingTechnique: 'sculpted',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },
  {
    name: 'Silk Press Blowout (Straightened Natural)',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/3732703/pexels-photo-3732703.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 20,
    ai_description: `### Title: Silk Press Blowout (Straightened Natural Hair)

---

### I. Style Foundation and Overall Structure
A glamorous portrait of a Black woman with a flawless Silk Press — a heat-straightening technique applied to natural hair that achieves bone-straight, silky-smooth results with high shine and movement, without chemical relaxers.

Hair Texture: Natural coily/kinky hair (Type 3C-4B) that has been professionally straightened using a blow dryer and flat iron. The original curl pattern is temporarily straightened while maintaining the hair's health and bounce.

Product Use: Heat protectant serum, smoothing cream, and a finishing shine spray or serum. The high-gloss finish and smooth texture indicate professional-grade products were used throughout the straightening process.

### II. Arrangement and Placement
The hair is parted either center or slightly off-center and falls in a sleek, voluminous cascade past the shoulders. The ends are slightly curved inward or left blunt for a polished, editorial look. Layers may be present, adding movement and body. The hair swings freely and catches light uniformly.

Length: Long (past shoulders, approaching mid-back)
Volume: Medium — body and bounce without excessive volume
Movement: High — the hair flows and moves naturally
Color: Natural dark brown/black with possible warm undertones

### III. Technical Details
- Style Type: Silk Press / Professional Blowout
- Method: Blow dry with tension, followed by flat iron in small sections
- Maintenance: High — must avoid moisture/humidity, wrap at night with silk scarf
- Longevity: 1-2 weeks (reverts to natural texture when washed)
- Complexity: Moderate (requires skilled stylist to avoid heat damage)
- Risk: Potential heat damage if done too frequently or at too high temperature`,
    attributes: {
      hairType: 'straight',
      length: 'long',
      stylingTechnique: 'flat-iron',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },
  {
    name: 'Fulani Braids with Center Cornrow',
    category: 'Braids',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/2648203/pexels-photo-2648203.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 25,
    ai_description: `### Title: Fulani Braids with Center Cornrow

---

### I. Style Foundation and Overall Structure
A stunning portrait of a Black woman wearing Fulani Braids — a signature West African braiding style characterized by a central cornrow running from the front hairline to the nape, flanked by side-swept cornrows or individual braids, often adorned with beads, cowrie shells, or metallic cuffs.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) used as the base, with braiding hair extensions added for length and uniformity. The combination provides a strong foundation for the intricate braiding pattern.

Product Use: A firm-hold braiding gel or edge control for clean partings and smooth roots, with a light oil applied to the scalp for moisture and itch prevention.

### II. Arrangement and Placement
The hallmark center cornrow runs straight back from the forehead to the nape. On each side, smaller cornrows or individual feed-in braids sweep laterally or diagonally from the center parting. The braids may transition from cornrows at the root to free-hanging box braids at the ends. Decorative elements (beads, rings, or wraps) are placed along select braids.

Pattern: Central cornrow + lateral/diagonal side cornrows
Length: Long (braids extend past shoulders)
Accessories: Beads, metallic cuffs, or cowrie shells on select braids
Color: Natural black with possible accent braids in a contrasting color

### III. Technical Details
- Style Type: Fulani Braids (Tribal/Cultural braiding style)
- Cultural Origin: Fulani/Fula people of West Africa
- Installation Method: Feed-in cornrow technique with extensions
- Maintenance: Low-medium — oil scalp every 2-3 days, sleep with silk bonnet
- Longevity: 4-6 weeks
- Complexity: Intricate`,
    attributes: {
      hairType: 'braided',
      length: 'long',
      stylingTechnique: 'feed-in-braid',
      volumeProfile: 'low',
      partingPattern: 'center',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },
  {
    name: 'Textured Mohawk with Burst Fade',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/17928570/pexels-photo-17928570.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 16,
    ai_description: `### Title: Textured Mohawk with Burst Fade

---

### I. Style Foundation and Overall Structure
A bold portrait of a Black man sporting a Textured Mohawk with Burst Fade — a modern cut where the hair is tapered or faded on the sides using a burst/radial pattern around the ears, while a strip of longer, textured hair runs from the forehead to the crown/nape.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) at the top, which is styled upward and textured with a sponge or twist technique. The sides show a clean gradient fade.

Product Use: A matte-finish styling clay or pomade for the textured top, with edge balm on the faded sides. Minimal shine — the look is intentionally matte and textured.

### II. Arrangement and Placement
The mohawk strip runs centrally from the front hairline to the crown, approximately 2-3 inches wide. The hair in the strip is styled upward and slightly forward, creating height and a forward-leaning silhouette. The burst fade radiates outward from each ear, creating a clean, rounded fade pattern on the sides and back.

Mohawk Width: 2-3 inches
Top Height: 2-4 inches (styled upward)
Fade Type: Burst fade around ears, blending to skin at the perimeter
Lineup: Sharp, precise edge-up
Color: Natural black, possibly with blonde or colored tips

### III. Technical Details
- Style Type: Mohawk with Burst Fade
- Cut Method: Clippers + foil shaver for fade, scissors/texturizing for mohawk strip
- Maintenance: High — weekly barber visits for fade, daily styling for mohawk shape
- Longevity: 1-2 weeks between cuts
- Complexity: Moderate to intricate`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A-4C',
      length: 'short',
      fadeType: 'burst-fade',
      hasLineup: true,
      stylingTechnique: 'sculpted',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'intricate',
      baseColor: 'natural-black',
      hasColorTreatment: true,
      colorNotes: 'Possible blonde or colored tips on mohawk strip',
      promptFamily: 'low-cut',
    },
  },
  {
    name: 'Passion Twists (Shoulder Length)',
    category: 'Twists',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/18977658/pexels-photo-18977658.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 19,
    ai_description: `### Title: Passion Twists (Shoulder Length)

---

### I. Style Foundation and Overall Structure
A beautiful portrait of a Black woman with Passion Twists — a modern protective style that combines the technique of two-strand twists with curly, textured braiding hair (typically Freetress water wave or similar) to create soft, bohemian twists with a natural, lived-in texture.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) at the base, with pre-looped or crochet-installed passion twist hair providing the signature soft, wavy texture. The twists have a deliberately undone, romantic quality.

Product Use: Mousse or lightweight styling foam on the natural hair before installation, with a light oil spray over the finished twists for sheen and softness.

### II. Arrangement and Placement
The twists are parted with a center or side part and hang freely past the shoulders. Each twist is medium-sized and uniform in thickness. The twists are distributed evenly across the head, with the front sections framing the face. The tips of the twists are left open/unraveled for a tapered, natural finish.

Length: Medium to long (shoulder to collarbone length)
Twist Size: Medium
Volume: Medium — not overly bulky
Texture: Soft, wavy, slightly frizzy (intentionally textured)
Color: Natural dark brown/black

### III. Technical Details
- Style Type: Passion Twists (protective style)
- Installation Method: Crochet or rubber-band method with pre-twisted hair
- Maintenance: Low — spritz with water/oil mix, sleep with bonnet
- Longevity: 6-8 weeks
- Complexity: Moderate`,
    attributes: {
      hairType: 'twisted',
      length: 'long',
      stylingTechnique: 'crochet',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },
  {
    name: 'Shaped Tapered Afro',
    category: 'Afros',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/1994818/pexels-photo-1994818.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 1,
    popularity: 30,
    ai_description: `### Title: Shaped Tapered Afro

---

### I. Style Foundation and Overall Structure
A striking portrait of a Black woman with a voluminous, shaped Tapered Afro — natural hair that has been picked out to maximum volume and shaped by a stylist into a rounded, symmetrical silhouette. The sides may be slightly tapered for a defined, sculpted look.

Hair Texture: Natural coily/kinky hair (Type 4B-4C) in its fully expressed, unmanipulated state. The tight coil pattern creates incredible density and volume, forming the signature afro silhouette. The hair's natural shrinkage is partially stretched by picking.

Product Use: A lightweight leave-in conditioner and a hair pick for maximum lift and volume. Possibly a light oil sheen for a healthy glow. Minimal heavy products to avoid weighing down the volume.

### II. Arrangement and Placement
The afro is shaped into a rounded or slightly oval silhouette with maximum volume at the crown and sides. The shape may be slightly tapered — shorter at the nape and sides, with full volume at the top. No visible parting — the hair is picked out uniformly for consistent density.

Length: Medium (appears shorter due to coil shrinkage; stretched length would be significantly longer)
Volume: Very high — maximum volume achieved through picking and fluffing
Shape: Rounded, symmetrical, possibly with slight taper at the nape
Color: Natural black/dark brown

### III. Technical Details
- Style Type: Tapered Afro / Shaped Natural Afro
- Styling Method: Washed, conditioned, picked out with an afro pick while damp, shaped with hands
- Maintenance: Medium — requires regular moisturizing, detangling, and reshaping
- Longevity: Daily restyling needed (sleeping compresses the shape)
- Complexity: Simple
- Cultural Significance: The afro is a powerful symbol of Black pride, natural beauty, and cultural identity`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B-4C',
      length: 'medium',
      stylingTechnique: 'natural',
      volumeProfile: 'very-high',
      partingPattern: 'none',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
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
    // Check for duplicate by name
    const exists = await Hairstyle.findOne({ name: style.name });
    if (exists) {
      console.log(`⏭  SKIP (exists): ${style.name}`);
      skipped++;
      continue;
    }

    // Upload image to Cloudinary
    const slug = style.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
    console.log(`📤 Uploading: ${style.name}...`);
    
    let thumbnailUrl;
    try {
      thumbnailUrl = await uploadToCloudinary(style.sourceUrl, slug);
    } catch (err) {
      console.error(`  ❌ Upload failed for ${style.name}:`, err.message);
      continue;
    }

    // Apply Cloudinary thumb transform for the stored thumbnail
    const thumbUrl = thumbnailUrl.replace('/upload/', '/upload/c_thumb,w_200,g_face/');

    // Insert into DB
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
    console.log(`  ✅ Created: ${style.name} (${style.category}, ${style.gender}, ${style.price} credits)`);
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
