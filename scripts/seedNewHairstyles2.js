/**
 * Seed batch 2 — 10 more hairstyles targeting underrepresented categories.
 * Run: node scripts/seedNewHairstyles2.js
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
  // ─── 1. Relaxed (filling 0 → 1) ──────────────────────────────────────────
  {
    name: 'Relaxed Layered Bob',
    category: 'Relaxed',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/8740338/pexels-photo-8740338.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 14,
    ai_description: `### Title: Relaxed Layered Bob

---

### I. Style Foundation and Overall Structure
A polished portrait of a Black woman with a professionally relaxed layered bob. The hair has been chemically straightened with a relaxer to achieve a smooth, sleek texture, then precision-cut into a chin-length bob with face-framing layers.

Hair Texture: Chemically relaxed (originally Type 4A-4C coily) to achieve a straight, smooth finish. The relaxer has been expertly applied to maintain body and movement — not bone-straight but with a soft, flowing quality.

Product Use: A smoothing serum for shine, a light-hold mousse for body, and possibly a heat protectant for finishing with a flat iron or wrap set. The ends show a slight inward curl suggesting a wrap or roller set finish.

### II. Arrangement and Placement
The bob falls at chin length with graduated layers that are shorter at the back and longer toward the face. A side part creates asymmetry, with more hair sweeping to one side. The layers frame the jawline and cheekbones, adding dimension and movement.

Length: Short (chin-length bob)
Volume: Low to medium — sleek with subtle body
Movement: Moderate — layers create swing and flow
Color: Natural dark brown/black

### III. Technical Details
- Style Type: Relaxed Layered Bob
- Chemical Process: Relaxer (sodium hydroxide or guanidine hydroxide)
- Cut: Precision bob with graduated layers
- Maintenance: High — relaxer touch-ups every 6-8 weeks, weekly wrap sets
- Longevity: Permanent straightening until new growth appears
- Complexity: Moderate`,
    attributes: {
      hairType: 'straight',
      length: 'short',
      stylingTechnique: 'flat-iron',
      volumeProfile: 'low',
      partingPattern: 'side-left',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // ─── 2. Fashion (filling 0 → 1) ──────────────────────────────────────────
  {
    name: 'Hot Pink Box Braids',
    category: 'Fashion',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/9324861/pexels-photo-9324861.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 28,
    ai_description: `### Title: Hot Pink Box Braids

---

### I. Style Foundation and Overall Structure
A bold, fashion-forward portrait of a Black woman with vibrant hot pink box braids. This style makes a powerful statement by combining the classic protective box braid technique with an eye-catching neon/hot pink braiding hair color.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) at the base, with pre-stretched synthetic braiding hair in a vivid hot pink color added for length and the signature color effect.

Product Use: A firm-hold edge control for clean partings and laid edges, braiding gel for grip during installation, and a mousse or setting lotion applied to the braids for a smooth, polished finish.

### II. Arrangement and Placement
The box braids are evenly distributed across the entire scalp using a clean grid/box parting pattern. Each braid is medium-sized and hangs freely past the shoulders. The front braids may be styled in a half-up arrangement or left to fall forward framing the face.

Braid Size: Medium box braids
Length: Long (past shoulders to mid-back)
Color: Vivid hot pink / neon pink throughout
Parting: Clean box/grid pattern
Volume: Medium — individual braids with natural drape

### III. Technical Details
- Style Type: Box Braids (fashion color variant)
- Installation Method: Three-strand braid with feed-in or traditional box method
- Color: Synthetic pre-colored braiding hair (hot pink)
- Maintenance: Low — moisturize scalp with oil every 2-3 days, sleep with silk bonnet
- Longevity: 6-8 weeks
- Complexity: Moderate to intricate
- Cultural Note: Bold color braids are a major trend in contemporary Black hair culture, blending protective styling with creative self-expression`,
    attributes: {
      hairType: 'braided',
      length: 'long',
      stylingTechnique: 'box-braid',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'intricate',
      baseColor: 'hot-pink',
      hasColorTreatment: true,
      colorNotes: 'Vivid hot pink synthetic braiding hair throughout',
      promptFamily: 'braids-twists',
    },
  },

  // ─── 3. Traditional (filling 1 → 2) ──────────────────────────────────────
  {
    name: 'African Thread Wrapping (Irun Kiko)',
    category: 'Traditional',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/10574773/pexels-photo-10574773.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 10,
    ai_description: `### Title: African Thread Wrapping (Irun Kiko)

---

### I. Style Foundation and Overall Structure
A culturally rich portrait showcasing the traditional African threading technique, known as Irun Kiko in Yoruba culture. Sections of natural hair are tightly wrapped from root to tip with black thread (or colorful thread), creating elongated, sculptural spikes or rods that stand upright or fan outward from the scalp.

Hair Texture: Natural coily/kinky hair (Type 4B-4C) which provides the grip and density necessary for the thread to hold securely. The wrapping technique also stretches the natural hair without heat.

Product Use: Minimal — a small amount of oil or shea butter may be applied to each section before wrapping to moisturize and protect. The thread itself provides all the hold and structure.

### II. Arrangement and Placement
The hair is sectioned into multiple parts — typically in rows from the front hairline to the nape. Each section is tightly spiraled with thread from root to tip, creating elongated cone or rod shapes. The sections can be arranged symmetrically or in creative patterns (crisscross, fan shape, etc.).

Number of Sections: 6-20 depending on desired pattern
Section Shape: Elongated rods/spikes standing upright or fanning outward
Thread Color: Black (traditional) or colorful (modern/festive)
Pattern: Symmetrical rows or artistic arrangement

### III. Technical Details
- Style Type: African Threading / Irun Kiko
- Cultural Origin: Yoruba people of Nigeria and across West Africa
- Installation Method: Section hair, anchor thread at root, spiral-wrap to tip under tension
- Maintenance: Very low — no daily styling needed, can be slept in
- Longevity: 1-3 weeks; doubles as a stretching method before unraveling for a thread-out
- Complexity: Simple to moderate
- Heat-Free Stretching: This technique naturally elongates coily hair without heat damage`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B-4C',
      length: 'medium',
      stylingTechnique: 'other',
      volumeProfile: 'low',
      partingPattern: 'geometric',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // ─── 4. Straight (filling 1 → 2) ─────────────────────────────────────────
  {
    name: 'Sleek Middle-Part Straight Install',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/36288155/pexels-photo-36288155.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 24,
    ai_description: `### Title: Sleek Middle-Part Straight Install

---

### I. Style Foundation and Overall Structure
A glamorous portrait of a Black woman with a long, sleek, bone-straight hairstyle parted down the center. This is achieved via a lace-front wig or sew-in weave installation using premium straight human hair bundles, creating a flawless, natural-looking finish.

Hair Texture: Premium quality straight human hair (Brazilian, Peruvian, or Indian origin) installed over natural coily hair that has been braided down flat underneath. The lace front or closure creates an invisible, natural-looking hairline.

Product Use: A smoothing serum for high-gloss shine, anti-humidity finishing spray, and possibly a light flat iron pass for a glass-smooth finish. The part line may have concealer or tint applied for a seamless blend.

### II. Arrangement and Placement
A precise center part runs from the front hairline to the crown. The hair falls symmetrically on both sides, cascading past the shoulders in a sleek, straight curtain. The ends are blunt-cut for a polished, editorial look. The hair catches light uniformly, indicating excellent product quality and styling.

Length: Extra-long (past shoulders, approaching waist)
Volume: Low to medium — sleek and flowing
Movement: High — the hair swings and flows freely
Color: Jet black / natural dark brown
Parting: Precise center part

### III. Technical Details
- Style Type: Straight Wig / Sew-In Weave Install
- Hair Type: Premium straight human hair bundles + lace closure
- Installation Method: Sew-in weave on cornrow base or lace-front wig with adhesive/wig band
- Maintenance: Medium — wrap at night, avoid tangling, use sulfate-free products
- Longevity: 4-8 weeks (sew-in) or reusable wig
- Complexity: Moderate (professional installation recommended)`,
    attributes: {
      hairType: 'straight',
      length: 'extra-long',
      stylingTechnique: 'sew-in',
      volumeProfile: 'low',
      partingPattern: 'center',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'protective-install',
    },
  },

  // ─── 5. Bob (filling 2 → 3) ──────────────────────────────────────────────
  {
    name: 'Blunt Cut Bob with Side Sweep',
    category: 'Bob',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/5980902/pexels-photo-5980902.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 17,
    ai_description: `### Title: Blunt Cut Bob with Side Sweep

---

### I. Style Foundation and Overall Structure
A sophisticated portrait of a Black woman with a precision-cut blunt bob. The hair is cut to a uniform length at the jawline with clean, sharp ends — no layers or graduation. This can be achieved with a wig, closure install, or natural/relaxed hair.

Hair Texture: Straight to slightly wavy hair (wig or straightened natural hair). The blunt ends create a structured, geometric shape that emphasizes the jawline and cheekbones.

Product Use: A glossing serum for mirror-like shine, light-hold finishing spray for movement, and edge control for a clean hairline. The smooth, uniform texture suggests flat iron finishing.

### II. Arrangement and Placement
The bob is parted slightly off-center or with a deep side part, creating an asymmetrical drape. The longer side sweeps across the forehead and tucks behind the ear or falls forward dramatically. The ends are perfectly even, creating a strong horizontal line at the jaw.

Length: Short (jaw-length)
Volume: Low — sleek and close to the head
Shape: Geometric, blunt, structured
Movement: Minimal — the bob holds its shape
Color: Jet black or deep dark brown

### III. Technical Details
- Style Type: Blunt Cut Bob (precision cut)
- Cut Method: Point cutting or razor for blunt ends
- Installation: Wig, closure sew-in, or cut on natural/relaxed hair
- Maintenance: Medium — requires regular trims to maintain blunt ends
- Longevity: Ongoing with trims every 4-6 weeks
- Complexity: Simple (cut) but requires skilled stylist for precision`,
    attributes: {
      hairType: 'straight',
      length: 'short',
      stylingTechnique: 'flat-iron',
      volumeProfile: 'low',
      partingPattern: 'side-left',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // ─── 6. Locs (filling 3 → 4) ─────────────────────────────────────────────
  {
    name: 'Short Starter Locs (Men\'s)',
    category: 'Locs',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/33838425/pexels-photo-33838425.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 1,
    popularity: 20,
    ai_description: `### Title: Short Starter Locs (Men's)

---

### I. Style Foundation and Overall Structure
A sharp portrait of a Black man with short starter locs — the early stage of the loc journey where individual sections of natural hair have been twisted, interlocked, or coiled and are beginning to lock and matt together into permanent dreadlocks.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) that provides excellent locking capability. The tight coil pattern naturally grips and matts together, making it ideal for loc formation.

Product Use: Minimal — a light loc gel or aloe vera-based locking gel may be used during retwisting sessions. The locs appear clean and product-free between maintenance sessions, which is ideal for the locking process.

### II. Arrangement and Placement
The starter locs are evenly distributed across the scalp in a grid or brick-lay pattern. Each loc is small to medium-sized and approximately 2-4 inches in length. The locs may stand upright due to their short length and the natural stiffness of the locking process, or lay slightly in various directions.

Loc Size: Small to medium
Length: Short (2-4 inches)
Pattern: Uniform grid or brick-lay parting
Loc Stage: Starter/budding stage (1-6 months in)
Color: Natural black

### III. Technical Details
- Style Type: Starter Locs / Baby Locs
- Method: Two-strand twist, coil, or interlock starter method
- Maintenance: Medium — retwist every 4-6 weeks, keep clean with residue-free shampoo
- Longevity: Permanent — locs mature over 12-18 months
- Complexity: Simple (installation), patience-intensive (maturation)
- Loc Journey: These will thicken, lengthen, and mature into full dreadlocks over time`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4A-4C',
      length: 'short',
      stylingTechnique: 'palm-roll',
      volumeProfile: 'low',
      partingPattern: 'geometric',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // ─── 7. Protective (filling 2 → 3) ───────────────────────────────────────
  {
    name: 'Jumbo Box Braids (Hip Length)',
    category: 'Protective',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/11515382/pexels-photo-11515382.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 32,
    ai_description: `### Title: Jumbo Box Braids (Hip Length)

---

### I. Style Foundation and Overall Structure
A stunning portrait of a Black woman with jumbo-sized box braids that extend to hip length. Jumbo braids feature large, chunky sections creating a bold, statement-making protective style that is quicker to install than smaller braids while still providing full coverage and protection.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) braided with pre-stretched synthetic braiding hair (Kanekalon or similar). The large section sizes mean fewer braids overall (typically 20-40 across the full head).

Product Use: Braiding gel for smooth partings, edge control for a clean hairline, and a lightweight oil or braid spray for scalp moisture and sheen on the braids.

### II. Arrangement and Placement
Large square or triangular partings create the base grid for each braid. The braids are distributed evenly across the head and hang freely with significant weight and movement. The front braids frame the face and can be swept to one side or pulled into a half-up style. The size of each braid creates a dramatic, sculptural effect.

Braid Size: Jumbo (large sections, approximately 1-1.5 inches per section)
Length: Extra-long (hip length)
Number of Braids: 20-40 total
Color: Natural black
Volume: Medium to high — the large braids create significant visual presence

### III. Technical Details
- Style Type: Jumbo Box Braids (protective style)
- Installation Method: Three-strand braid with extensions, large box partings
- Installation Time: 2-4 hours (faster than medium or small braids)
- Maintenance: Low — oil scalp every 2-3 days, wrap at night, wash scalp bi-weekly
- Longevity: 4-6 weeks
- Complexity: Simple to moderate (larger sections = faster, fewer braids)`,
    attributes: {
      hairType: 'braided',
      length: 'extra-long',
      stylingTechnique: 'box-braid',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // ─── 8. Modern (filling 2 → 3) ───────────────────────────────────────────
  {
    name: 'Natural Frohawk Updo',
    category: 'Modern',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/7148701/pexels-photo-7148701.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 13,
    ai_description: `### Title: Natural Frohawk Updo

---

### I. Style Foundation and Overall Structure
A striking portrait of a Black woman with a natural frohawk — a faux mohawk style achieved by pinning the sides of natural hair flat or creating flat twists/cornrows on the sides while leaving the center strip of hair free and voluminous, creating a mohawk-like ridge of natural texture.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) in its fully expressed state at the center, with the sides either pinned, twisted, or cornrowed flat to the scalp. The center strip showcases the hair's natural volume and texture.

Product Use: A curl defining cream or gel for the center section, edge control for the flat sides, and bobby pins or small elastics for securing the side sections. A pick may be used to maximize height and volume on the center strip.

### II. Arrangement and Placement
The sides are flattened against the scalp — either pinned with bobby pins, twisted into flat twists, or braided into cornrows directed upward toward the center. The center strip runs from the forehead to the nape and is free, voluminous, and textured. The center hair may be stretched slightly for added height or left in its natural shrunken state for a compact, defined look.

Center Strip Width: 3-5 inches
Center Volume: High — natural coils achieving maximum height
Side Treatment: Pinned flat, flat-twisted, or cornrowed
Color: Natural black/dark brown

### III. Technical Details
- Style Type: Frohawk / Faux Hawk (natural hair)
- Styling Method: Pin/twist sides flat, fluff center with pick
- Maintenance: Low-medium — refresh sides daily, re-pin as needed
- Longevity: 1-3 days (pin method) or up to 1 week (cornrow sides)
- Complexity: Simple to moderate
- Versatility: Can be dressed up for events or worn casually`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A-4C',
      length: 'medium',
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // ─── 9. Afros (filling 3 → 4) ────────────────────────────────────────────
  {
    name: 'TWA (Teeny Weeny Afro) — Big Chop',
    category: 'Afros',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/2869056/pexels-photo-2869056.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 1,
    popularity: 26,
    ai_description: `### Title: TWA (Teeny Weeny Afro) — Big Chop

---

### I. Style Foundation and Overall Structure
A radiant portrait of a Black woman with a TWA (Teeny Weeny Afro) — the signature short natural hairstyle that often marks the beginning of a natural hair journey after a big chop (cutting off all chemically processed hair). The hair is very short, close to the scalp, showing off the face and bone structure beautifully.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) at its shortest wearable length — typically 0.5 to 2 inches. The tight coil pattern creates a soft, velvety texture close to the head. Each coil is distinct and well-defined despite the short length.

Product Use: A light leave-in conditioner and a curl-defining gel or cream for moisture and slight definition. A small amount of oil for sheen. The minimal product approach lets the natural texture speak for itself.

### II. Arrangement and Placement
The TWA is uniform in length across the entire head — no parts, no directional styling. The hair forms a soft, even cap that follows the natural contour of the head. The hairline is natural and soft, with the coils beginning right at the growth line.

Length: Buzz to short (0.5-2 inches)
Volume: Low — close to the scalp
Shape: Follows the natural head shape
Color: Natural black/dark brown
Coverage: Full, even coverage

### III. Technical Details
- Style Type: TWA / Teeny Weeny Afro / Big Chop
- Cut Method: Scissors or clippers to remove relaxed/damaged ends
- Maintenance: Very low — wash, condition, apply light product, go
- Longevity: Ongoing — grows out naturally into longer natural styles
- Complexity: Simple
- Cultural Significance: The big chop/TWA is a milestone in the natural hair movement, symbolizing liberation from chemical processing and embracing natural texture`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A-4C',
      length: 'buzz',
      stylingTechnique: 'natural',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // ─── 10. Twists (filling 2 → 3) ──────────────────────────────────────────
  {
    name: 'Long Marley Twists',
    category: 'Twists',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/11515407/pexels-photo-11515407.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 21,
    ai_description: `### Title: Long Marley Twists

---

### I. Style Foundation and Overall Structure
A beautiful portrait of a Black woman with long Marley twists — a protective style that uses Marley braiding hair (textured, kinky synthetic hair that mimics natural Afro-textured hair) to create two-strand twists that have a naturally kinky, matte finish rather than the sleek look of standard braiding hair.

Hair Texture: Natural coily/kinky hair (Type 4A-4C) at the base, with Marley hair extensions twisted around each section. The Marley hair's kinky texture blends seamlessly with natural African-textured hair, creating a cohesive, natural-looking result.

Product Use: A lightweight locking gel or mousse on the natural hair before twisting for grip and hold. A braid/twist spray with oil for moisture and to reduce frizz. The matte finish is characteristic of Marley hair texture — no glossy products applied.

### II. Arrangement and Placement
The twists are parted in medium-sized sections (box or triangle partings) and twisted from root to tip. The twists hang freely past the shoulders with a natural, slightly unstructured drape. The tips may be left loose for a tapered effect or sealed with hot water dipping.

Twist Size: Medium
Length: Long (past shoulders to mid-back)
Texture: Kinky, matte — mimicking natural 4C texture in twisted form
Color: Natural dark brown/black (Marley hair color #1B or #2)
Volume: Medium — individually lightweight but collectively full

### III. Technical Details
- Style Type: Marley Twists / Kinky Twists (protective style)
- Hair Used: Marley braiding hair (Afro kinky texture)
- Installation Method: Two-strand twist with Marley hair wrapped around natural sections
- Maintenance: Low — spritz with water/oil mix, sleep with satin bonnet
- Longevity: 4-8 weeks
- Complexity: Moderate
- Comparison: Softer, more natural-looking than Senegalese/rope twists; textured vs. smooth`,
    attributes: {
      hairType: 'twisted',
      length: 'long',
      stylingTechnique: 'crochet',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'moderate',
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
