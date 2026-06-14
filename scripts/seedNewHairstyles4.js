/**
 * Seed batch 4 — 10 premium hairstyles with studio-quality images.
 * Targets: Straight(2→4), Relaxed(2→3), Traditional(3→4), Fashion(2→3),
 *          Coils(6→7), Braids(19→20), Weaves(7→8), Protective(4→5), Modern(4→5), Fades(8→9)
 * Run: node scripts/seedNewHairstyles4.js
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
  // ─── 1. Silk Press with Curtain Bangs (Straight) ─────────────────────────
  {
    name: 'Silk Press with Curtain Bangs',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/36288139/pexels-photo-36288139.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 42,
    ai_description: `### Title: Silk Press with Curtain Bangs

---

### I. Style Foundation and Overall Structure
A polished studio portrait of a Black woman with a professionally done silk press — natural kinky or coily hair that has been blow-dried and flat-ironed to a sleek, silky-straight finish without a chemical relaxer. The curtain bangs frame the face softly, parting in the center and sweeping outward on each side.

Hair Texture: Natural Type 4A-4C hair, temporarily straightened through heat styling (silk press technique). The result is bone-straight, glossy hair with movement and body — bouncy rather than stiff.

Product Use: Heat protectant serum applied before blow-drying and flat-ironing, a lightweight silk finishing serum or argan oil for high-gloss shine, and a humidity-resistant holding spray to maintain the press and prevent reversion.

### II. Arrangement and Placement
The hair falls past the shoulders in a long, flowing silhouette. The curtain bangs are cut to cheekbone length, parted down the center, and blend seamlessly into the longer layers. The overall look is voluminous at the roots, sleek through the mid-lengths, and features soft, face-framing movement.

Length: Long (past shoulders, chest-length)
Bangs: Curtain-style, center-parted, cheekbone length
Volume: Medium — body and bounce, not flat
Finish: High-gloss silk sheen
Color: Natural black (#1B)

### III. Technical Details
- Style Type: Silk Press with Curtain Bangs
- Method: Blow-dry + flat iron on natural hair (no chemical relaxer)
- Key Advantage: Temporary straightening — hair reverts to natural texture when wet
- Maintenance: Avoid moisture/sweat, wrap hair at night in silk scarf
- Longevity: 1-2 weeks depending on humidity and care
- Complexity: Moderate (requires skilled flat-iron technique)
- Best For: Type 3C-4C natural hair, special occasions, versatile styling`,
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

  // ─── 2. Middle Part Bone Straight Install (Straight) ─────────────────────
  {
    name: 'Middle Part Bone Straight Install',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/18348405/pexels-photo-18348405.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 37,
    ai_description: `### Title: Middle Part Bone Straight Install

---

### I. Style Foundation and Overall Structure
A dramatic studio portrait of a Black woman with an ultra-long, bone-straight middle-part hairstyle — achieved through a lace-front wig or sew-in weave installation. The hair is perfectly straight with zero frizz, creating a sleek, high-fashion silhouette that cascades down well past the shoulders.

Hair Texture: Premium human hair extensions or HD lace-front wig — 100% straight (often labeled "bone straight" or "silky straight"). The hair lies completely flat with no wave or texture, creating a mirror-like finish.

Product Use: Wig adhesive or got2b gel for a seamless lace melt at the hairline, flat-iron for final smoothing, a high-shine finishing serum, and edge control for baby hairs.

### II. Arrangement and Placement
The hair is parted precisely down the center, creating two symmetrical curtains of straight hair. It falls from the scalp in a smooth, unbroken line — no layers, no texture breaks. The length extends past the bust line. The hairline is flawlessly blended with the lace melted invisibly into the skin.

Length: Extra-long (bust to waist length, 24-30 inches)
Part: Precise center part
Volume: Low-medium — sleek and gravity-driven
Finish: Ultra-glossy, bone-straight
Color: Jet black (#1) or natural black (#1B)

### III. Technical Details
- Style Type: Bone Straight Middle Part (Lace-Front or Sew-In)
- Installation: HD lace-front wig with lace melt, or closure sew-in
- Hair Grade: Premium human hair (10A-12A), often Brazilian or Peruvian straight
- Maintenance: Wrap at night, minimal heat re-styling, wig cap underneath
- Longevity: 4-8 weeks (sew-in) or ongoing (wig with proper care)
- Complexity: Moderate (professional installation recommended)
- Trend Status: Perennial bestseller in the wig/weave market`,
    attributes: {
      hairType: 'straight',
      length: 'extra-long',
      stylingTechnique: 'sew-in',
      volumeProfile: 'low',
      partingPattern: 'center',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // ─── 3. Chic Cropped Natural (Relaxed) ───────────────────────────────────
  {
    name: 'Chic Cropped Natural with Earrings',
    category: 'Relaxed',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/30220176/pexels-photo-30220176.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 1,
    popularity: 20,
    ai_description: `### Title: Chic Cropped Natural with Earrings

---

### I. Style Foundation and Overall Structure
A vibrant studio portrait of a Black woman with a chic, closely cropped hairstyle — a bold, low-maintenance look that showcases the natural beauty of short hair against her face shape. The crop is neat and styled, sitting close to the head with a soft, textured finish.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) cut short and tapered, or relaxed/texturized and cropped close. The short length creates a clean, sculpted silhouette that highlights facial features — cheekbones, eyes, and jawline.

Product Use: A light moisturizer or curl-defining cream to maintain texture and sheen. Edge control for a clean hairline. Minimal product needed due to the short length — the style speaks for itself.

### II. Arrangement and Placement
The hair is uniformly short across the head — typically 1-3 inches — with possible slight tapering at the nape and sides. The natural texture creates a soft, velvety appearance. The style is fresh and modern, often accentuated with statement earrings and bold makeup.

Length: Short (1-3 inches)
Volume: Low — sits close to the head
Texture: Natural coily or texturized
Finish: Soft matte with subtle sheen
Color: Natural black

### III. Technical Details
- Style Type: Cropped Natural / Short Texturized Cut
- Method: Clipper cut with scissors for shaping, optional texturizer for looser curl pattern
- Maintenance: Very low — weekly wash, light moisturizer, occasional barber trim
- Longevity: Ongoing — barber visit every 2-4 weeks for shape maintenance
- Complexity: Simple
- Best For: Oval, heart, and diamond face shapes; confident, fashion-forward styling
- Icon Status: Popularized by Lupita Nyong'o, Halle Berry, and other fashion icons`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A-4C',
      length: 'short',
      stylingTechnique: 'tapered',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // ─── 4. Kinky Twists, Shoulder Length (Traditional) ──────────────────────
  {
    name: 'Kinky Twists (Shoulder Length)',
    category: 'Traditional',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/30091514/pexels-photo-30091514.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 24,
    ai_description: `### Title: Kinky Twists (Shoulder Length)

---

### I. Style Foundation and Overall Structure
A warm portrait of a smiling Black woman with kinky twists — a classic protective style made by two-strand twisting natural hair with kinky-textured braiding hair (Afro or Marley hair). The result is a natural, textured twist that mimics the look of natural hair while providing length and protection.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) at the base, with kinky-textured synthetic hair (Afro or Marley hair) added to each twist. The textured braiding hair matches the natural hair's kinky pattern, creating a cohesive, natural-looking finish.

Product Use: Braiding gel or moisturizing cream for smooth parting, lightweight oil for scalp care, and a mousse or twist cream for definition and frizz control.

### II. Arrangement and Placement
The twists are medium-sized and parted in neat, uniform sections across the entire head. They fall to shoulder length with a natural, bouncy movement. The kinky texture gives each twist a fuller, more organic appearance compared to smooth Senegalese twists. The style frames the face naturally and can be worn down, half-up, or in a bun.

Twist Size: Medium
Length: Shoulder length (12-14 inches)
Texture: Kinky/afro-textured — natural, matte finish
Volume: Medium — fuller than Senegalese twists due to texture
Color: Natural black or dark brown

### III. Technical Details
- Style Type: Kinky Twists / Afro Twists
- Hair Used: Afro kinky braiding hair or Marley hair
- Installation: Two-strand twist with extension hair, twisted from root to tip
- Installation Time: 3-5 hours
- Maintenance: Low — moisturize scalp, light oil, sleep with bonnet
- Longevity: 4-8 weeks
- Complexity: Moderate
- Cultural Note: A staple protective style in the Black natural hair community since the 1990s`,
    attributes: {
      hairType: 'twisted',
      length: 'medium',
      stylingTechnique: 'other',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // ─── 5. Stitch Braids / Feed-In Cornrows (Braids) ───────────────────────
  {
    name: 'Stitch Braids (Feed-In Cornrows)',
    category: 'Braids',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/5085996/pexels-photo-5085996.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 40,
    ai_description: `### Title: Stitch Braids (Feed-In Cornrows)

---

### I. Style Foundation and Overall Structure
A striking close-up portrait of a Black woman with immaculate stitch braids — a variation of cornrows where the feed-in technique creates a distinctive "stitched" pattern along each braid track. The partings are razor-sharp and the braids lie flat against the scalp in clean, parallel lines.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) cornrowed flat against the scalp with small sections of braiding hair fed in gradually. The feed-in technique ensures the braids start thin and gradually thicken, reducing tension at the hairline.

Product Use: Strong-hold braiding gel for ultra-clean, precise partings. Edge control on the hairline. The "stitch" effect comes from the braiding technique — the braider picks up small, precise sections in a deliberate pattern that creates visible neat lines perpendicular to the braid.

### II. Arrangement and Placement
The cornrows run from the front hairline straight back (or in a chosen directional pattern). The stitch pattern is highly visible along the parts — each section pickup creates a small perpendicular "stitch" mark. The braids are medium-sized, evenly spaced, and perfectly parallel.

Braid Pattern: Straight-back parallel rows
Braid Size: Small to medium
Stitch Detail: Visible perpendicular pickup marks along each row
Part Lines: Razor-sharp, clean, white lines
Length: Braids may extend with added hair or be tucked/pinned

### III. Technical Details
- Style Type: Stitch Braids / Feed-In Cornrows with Stitch Pattern
- Method: Feed-in cornrow technique with deliberate small-section pickups
- Installation Time: 3-5 hours
- Maintenance: Low — scarf at night, oil scalp every 2-3 days
- Longevity: 2-4 weeks
- Complexity: Intricate (requires precision and skill)
- Trend Status: Massively popular on social media — the clean partings are the hallmark`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A-4C',
      length: 'medium',
      stylingTechnique: 'feed-in-braid',
      volumeProfile: 'low',
      partingPattern: 'geometric',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // ─── 6. Elegant Bantu Knots (Fashion) ────────────────────────────────────
  {
    name: 'Elegant Bantu Knots',
    category: 'Fashion',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/28656263/pexels-photo-28656263.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 31,
    ai_description: `### Title: Elegant Bantu Knots

---

### I. Style Foundation and Overall Structure
A dramatic studio portrait of a Black woman wearing regal Bantu knots — small, coiled knots created by twisting sections of hair and wrapping them into neat, spiraling buns pinned close to the scalp. The style is photographed against a dark backdrop, highlighting the sculptural beauty of each knot and the elegant gold accessories.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) — the tight curl pattern is ideal for Bantu knots as it provides natural grip and hold. Each section is twisted tightly and then wrapped around itself to form a compact, raised coil.

Product Use: A moisturizing twist cream or butter for smooth sectioning and pliable hold, edge control for a polished hairline, and a light oil sheen for a refined finish.

### II. Arrangement and Placement
The knots are distributed symmetrically across the entire head in a geometric grid pattern — typically 8-15 knots depending on size preference. Each knot is uniform in size and sits raised off the scalp like a small sculptural dome. The parts between knots are clean and precise.

Knot Count: 8-15 knots in a symmetrical pattern
Knot Size: Medium uniform
Height: Raised 1-2 inches off scalp
Part Lines: Clean, geometric sectioning
Accessories: Gold statement earrings complement the style

### III. Technical Details
- Style Type: Bantu Knots (also called Zulu Knots or China Bumps)
- Cultural Origin: Zulu people of Southern Africa — "Bantu" from the broader Bantu-speaking peoples
- Method: Section → twist → wrap into coil → pin or tuck
- Dual Purpose: Can be unraveled into a "Bantu knot-out" for defined curls/waves
- Maintenance: Very low — knots hold on their own, sleep with silk scarf
- Longevity: 1-2 weeks as knots, or unravel after 1-2 days for knot-out curls
- Complexity: Moderate
- Cultural Significance: Ancient African style with ceremonial and everyday significance`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A-4C',
      length: 'short',
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // ─── 7. Voluminous Wash-and-Go Curls (Coils) ────────────────────────────
  {
    name: 'Voluminous Wash-and-Go Curls',
    category: 'Coils',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/34244334/pexels-photo-34244334.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 1,
    popularity: 35,
    ai_description: `### Title: Voluminous Wash-and-Go Curls

---

### I. Style Foundation and Overall Structure
A chic studio portrait of a Black woman with a stunning, voluminous wash-and-go — her natural curls are fully hydrated, defined, and free-flowing with maximum volume. The curls cascade outward and upward in a full, rounded silhouette that frames the face beautifully.

Hair Texture: Natural Type 3C-4A curly/coily hair in its natural state — washed, conditioned, and styled with curl-defining products while wet, then allowed to air dry or diffused. The curl pattern ranges from tight spirals to coils with excellent definition.

Product Use: A sulfate-free shampoo and deep conditioner for wash day, followed by a leave-in conditioner, a curl-defining gel or cream (eco styler, Camille Rose, or similar), and a lightweight oil to seal. The "wash and go" technique relies on applying products to soaking-wet hair, then not touching it during drying.

### II. Arrangement and Placement
The curls are distributed naturally around the head with incredible volume — big, round, and face-framing. There is no defined part visible — the hair rises from the scalp with lift and falls in defined spiral coils. The volume is highest at the mid-lengths and crown. The front curls frame the forehead and cheekbones.

Volume: Very high — dramatic, full, rounded shape
Curl Definition: High — individual spirals clearly visible
Length (stretched): Medium-long (shoulder to armpit length)
Length (natural): Above shoulders due to coil shrinkage
Color: Natural dark brown or black
Finish: Glossy with a soft, touchable look

### III. Technical Details
- Style Type: Wash-and-Go (WNG)
- Method: Wash → condition → apply styling products to soaking wet hair → air dry or diffuse → fluff
- Key Products: Leave-in + gel/cream + oil (LOC or LCO method)
- Maintenance: Medium — refresh with water spray + product between wash days
- Longevity: 3-7 days per wash-and-go set
- Complexity: Simple technique, but requires learning one's curl pattern
- Community Note: The wash-and-go is a cornerstone of the natural hair movement`,
    attributes: {
      hairType: 'curly',
      length: 'medium',
      stylingTechnique: 'natural',
      volumeProfile: 'very-high',
      partingPattern: 'free-form',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // ─── 8. Shadow Fade with Textured Top (Fades, male) ─────────────────────
  {
    name: 'Shadow Fade with Textured Top',
    category: 'Fades',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/14917484/pexels-photo-14917484.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 1,
    popularity: 28,
    ai_description: `### Title: Shadow Fade with Textured Top

---

### I. Style Foundation and Overall Structure
A professional studio portrait of a Black man with a modern shadow fade — a contemporary barber cut where the sides gradually blend from very short at the bottom to the fuller textured hair on top, creating a subtle "shadow" gradient effect. The top retains natural texture with defined waves or curls.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) — the top is left longer (1-3 inches) with natural curl pattern defined through sponge or brush technique. The sides transition seamlessly from skin-close to the longer top through a shadow (no-line) fade.

Product Use: A wave cream or curl sponge for texturing the top, edge control for a sharp lineup, aftershave balm on the faded sides for a clean finish.

### II. Arrangement and Placement
The top hair is the focal point — textured, defined, and styled upward or forward. The fade transitions gradually along the sides and back. The lineup at the forehead and temples may be razor-sharp or naturally shaped. Sideburns blend cleanly into the fade.

Top Length: 1-3 inches with texture
Fade Type: Shadow fade (gradual blend, no hard line)
Lineup: Clean edge-up on forehead and temples
Back: Tapered to the nape
Color: Natural black

### III. Technical Details
- Style Type: Shadow Fade with Textured Top
- Fade Method: Clipper gradient (#0.5 at base to #2-3 blending into top)
- Top Styling: Sponge for curl definition or brush for wave pattern
- Maintenance: Medium — barber visit every 1-2 weeks
- Longevity: 1-2 weeks between cuts
- Complexity: Simple (cut) but requires skilled barber for seamless blend
- Best For: Professional and casual settings, versatile and modern`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A-4C',
      length: 'short',
      fadeType: 'shadow-fade',
      hasLineup: true,
      stylingTechnique: 'sculpted',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // ─── 9. Deep Wave Lace-Front Bob (Weaves) ───────────────────────────────
  {
    name: 'Deep Wave Lace-Front Bob',
    category: 'Weaves',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/17362828/pexels-photo-17362828.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 30,
    ai_description: `### Title: Deep Wave Lace-Front Bob

---

### I. Style Foundation and Overall Structure
A glamorous portrait of a Black woman wearing a deep wave lace-front bob wig — a wavy, textured bob-length wig installed with a melted lace front for a natural-looking hairline. The deep wave pattern creates a romantic, beachy texture with consistent S-shaped waves throughout.

Hair Texture: Premium human hair lace-front wig in a "deep wave" or "water wave" texture — continuous S-shaped waves that create dimension and movement. The lace front is melted seamlessly at the hairline for an undetectable install.

Product Use: Lace adhesive or got2b gel for hairline melting, a wave mousse for maintaining the curl pattern, an anti-frizz serum for smoothness, and a light hold finishing spray.

### II. Arrangement and Placement
The wig is styled in a bob silhouette — falling between chin and shoulder length. The deep wave texture adds volume and dimension. The part (middle or side) is defined at the lace front. The waves cascade uniformly from root to tip, creating a full, glamorous frame around the face.

Length: Short-medium (chin to shoulder)
Texture: Deep wave — consistent S-pattern throughout
Volume: High — waves add body and fullness
Part: Can be middle or side (lace allows versatility)
Finish: Glossy, romantic, red-carpet ready
Color: Dark brown or black, can include highlights

### III. Technical Details
- Style Type: Deep Wave Lace-Front Bob Wig
- Wig Type: HD or transparent lace front, pre-plucked hairline
- Hair Used: 100% human hair, deep wave texture, 10-14 inch
- Installation: Lace melt with adhesive or elastic band method
- Maintenance: Wash with sulfate-free shampoo, air dry on wig stand, mousse to refresh waves
- Longevity: Wig lasts 1+ year with care; install lasts 2-6 weeks
- Complexity: Moderate (installation requires skill)
- Versatility: Can be flat-ironed straight or curled tighter for different looks`,
    attributes: {
      hairType: 'wavy',
      length: 'short',
      stylingTechnique: 'wig',
      volumeProfile: 'high',
      partingPattern: 'center',
      complexity: 'moderate',
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // ─── 10. Crown Braid Updo (Protective) ──────────────────────────────────
  {
    name: 'Crown Braid Updo (Halo Braid)',
    category: 'Protective',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/15933989/pexels-photo-15933989.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 22,
    ai_description: `### Title: Crown Braid Updo (Halo Braid)

---

### I. Style Foundation and Overall Structure
A sophisticated studio portrait of a Black woman with a beautiful crown braid updo — also known as a halo braid — where one or two thick braids wrap around the head like a crown. This elegant style elevates the classic cornrow into a regal, formal look suitable for weddings, galas, and editorial shoots.

Hair Texture: Natural coily/kinky hair (Type 3C-4C) braided with or without extensions. The natural texture provides excellent grip for the braid to wrap securely around the head. Extensions can add length and fullness to the wrap.

Product Use: Braiding gel for clean, smooth sections and a secure hold. Edge control for a polished hairline. A finishing oil or sheen spray for a refined, glossy appearance.

### II. Arrangement and Placement
The braid begins at one temple and wraps around the perimeter of the head in a continuous circle, ending where it started and tucked underneath. The braid sits like a crown atop the head, 1-2 inches above the hairline. It can be a single thick braid or two braids that overlap at the back.

Braid Type: Single or double Dutch/French braid
Size: Thick — one statement braid or two overlapping
Placement: Wraps around the crown of the head
Height: Sits elevated, creating a tiara/crown effect
Finish: Polished, sleek, formal-ready
Color: Natural black, can include woven-in accessories (flowers, pins)

### III. Technical Details
- Style Type: Crown Braid / Halo Braid Updo
- Method: French or Dutch braiding in a circular path around the head
- Installation: Can be self-done (with practice) or professionally installed
- Installation Time: 30-60 minutes
- Maintenance: Very low — secure with pins, wrap with satin scarf at night
- Longevity: 1-2 weeks
- Complexity: Moderate to intricate
- Occasion: Weddings, formal events, editorial, Afrocentric ceremonies
- Cultural Significance: Braided updos are found across African, Caribbean, and African American formal traditions`,
    attributes: {
      hairType: 'braided',
      length: 'medium',
      stylingTechnique: 'cornrow',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'intricate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
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
