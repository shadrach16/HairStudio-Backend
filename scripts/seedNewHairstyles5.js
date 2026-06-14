/**
 * Seed batch 5 — 10 premium hairstyles with studio-quality Pexels images.
 * Targets under-represented categories:
 *   Traditional(4→6), Fashion(3→4), Relaxed(3→4), Locs(5→6),
 *   Afros(4→5), Twists(4→5), Modern(4→5), Bob(4→5), Fades(9→10)
 * Run: node scripts/seedNewHairstyles5.js
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
  // ─── 1. Bantu Knots with Gold Accessories (Traditional) ──────────────
  {
    name: 'Bantu Knots with Gold Accessories',
    category: 'Traditional',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/28656263/pexels-photo-28656263.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 38,
    ai_description: `### Title: Bantu Knots with Gold Accessories

### I. Style Foundation and Overall Structure
An elegant portrait of a Black woman with evenly spaced Bantu knots arranged symmetrically across the entire head. The knots are tight, uniformly sized, and neatly coiled, showcasing precise sectioning and tension control. Gold hoop earrings complement the traditional aesthetic.

Hair Texture: Natural Type 4B-4C coily hair, providing excellent hold for the tightly wound knots. The natural texture allows each knot to hold its shape without slipping or unraveling.

Product Use: A strong-hold styling gel or butter applied to each section before twisting and coiling into the knot formation. A light sheen oil adds gloss to the finished knots.

### II. Arrangement and Placement
The Bantu knots are arranged in a grid-like pattern across the scalp, with clean, straight partings between each section. Approximately 12-16 knots of uniform size cover the entire head from hairline to nape. Each knot sits close to the scalp, coiled tightly in a spiral pattern.

Parting: Geometric grid pattern with clean, precise lines
Knot Size: Uniform, medium (approximately 1.5-2 inches in diameter)
Knot Height: Low-profile, sitting close to the scalp
Scalp Visibility: Moderate — clean parts visible between knots
Coverage: Full head, from front hairline to nape

### III. Technical Details
- Style Type: Bantu Knots (Zulu Knots)
- Hair Length Required: Medium to long natural hair
- Method: Section, two-strand twist each section, then coil around itself into a knot and tuck the end
- Complexity: Moderate — requires patience and even tension
- Longevity: 3-7 days; can be unraveled for a knot-out curl pattern
- Cultural Significance: Originates from the Zulu people of Southern Africa; a celebrated traditional protective style
- Best For: Type 3C-4C natural hair`,
    attributes: {
      hairType: 'coily',
      length: 'medium',
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // ─── 2. Bantu Knots on White Backdrop (Traditional) ──────────────────
  {
    name: 'Elegant Bantu Knots with Gold Jewelry',
    category: 'Traditional',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/36771241/pexels-photo-36771241.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 35,
    ai_description: `### Title: Elegant Bantu Knots with Gold Jewelry

### I. Style Foundation and Overall Structure
A striking studio portrait of a Black woman wearing Bantu knots styled with a high-fashion editorial sensibility. The knots are perfectly formed and evenly distributed, set against a clean white backdrop that highlights every detail of the style. Gold chain jewelry adds a contemporary luxury element.

Hair Texture: Natural Type 4A-4C coily hair, tightly wound into each knot for maximum definition and hold. The dense texture provides structure and prevents the knots from loosening over time.

Product Use: Edge control gel for a sleek hairline, a firm-hold styling cream throughout the sections before twisting, and a light finishing oil for sheen. The edges appear meticulously smoothed.

### II. Arrangement and Placement
The Bantu knots are arranged in a symmetrical pattern with slightly larger knots at the crown and smaller ones near the perimeter. The hairline is softly shaped with no harsh edges. Clean partings between each section are visible, demonstrating skilled sectioning technique.

Parting: Symmetrical brick-lay pattern
Knot Size: Varied — larger at crown, smaller at hairline
Surface Finish: Smooth, glossy knots with minimal frizz
Edges: Smoothed and laid with edge control
Coverage: Full head coverage

### III. Technical Details
- Style Type: Bantu Knots (elevated/editorial styling)
- Method: Section, twist, coil, and tuck; edges laid separately
- Complexity: Moderate to intricate
- Longevity: 5-7 days with nightly bonnet protection
- Versatility: Can transition to bantu knot-out curls when unraveled
- Cultural Heritage: A pan-African protective hairstyle with deep roots in Southern and East African traditions
- Best For: Type 4A-4C hair, all face shapes`,
    attributes: {
      hairType: 'coily',
      length: 'medium',
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'intricate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // ─── 3. Statement Chain-Adorned Sleek Style (Fashion) ────────────────
  {
    name: 'Sleek Low Bun with Statement Earrings',
    category: 'Fashion',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/2009395/pexels-photo-2009395.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 45,
    ai_description: `### Title: Sleek Low Bun with Statement Earrings

### I. Style Foundation and Overall Structure
A fashion-forward portrait of a Black woman with her hair swept into a sleek, low bun or chignon at the nape, styled to complement bold statement jewelry and a high-fashion outfit. The hair is smoothed back with a high-gloss finish, emphasizing the face and neckline.

Hair Texture: Natural hair that has been smoothed and slicked using heat styling or a strong-hold gel to achieve a polished, editorial finish. The result is a glass-smooth surface from hairline to bun.

Product Use: Firm-hold gel or pomade for the slick-back effect, edge control for baby hairs and hairline, finishing serum or oil for extreme gloss, and possibly a light-hold hairspray for all-day staying power.

### II. Arrangement and Placement
The hair is parted in the center or swept entirely back, combed flat against the scalp and gathered into a compact, low bun at the nape. The bun itself is neat and tightly coiled or pinned. The overall silhouette is clean and architectural.

Parting: Center or none (swept back)
Volume: Flat/sleek from root to bun
Bun Position: Low, at the nape of the neck
Finish: Ultra-high gloss
Edge Work: Baby hairs smoothed or sculpted

### III. Technical Details
- Style Type: Sleek Low Bun / Chignon
- Method: Gel application, combing back, securing with elastic and pins, smoothing with brush/toothbrush
- Complexity: Moderate — technique-dependent for a flawless finish
- Best For: Formal events, editorial shoots, runway-inspired looks
- Longevity: 1-2 days
- Maintenance: Touch-up edges as needed; wrap in silk scarf at night
- Versatility: Works on relaxed, pressed, or natural hair (with smoothing products)`,
    attributes: {
      hairType: 'straight',
      length: 'long',
      stylingTechnique: 'flat-iron',
      volumeProfile: 'flat',
      partingPattern: 'center',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // ─── 4. Voluminous Afro Curls (Relaxed) ──────────────────────────────
  {
    name: 'Voluminous Loose Curls with Body',
    category: 'Relaxed',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/31704823/pexels-photo-31704823.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 40,
    ai_description: `### Title: Voluminous Loose Curls with Body

### I. Style Foundation and Overall Structure
An elegant portrait of a Black woman with voluminous, loose curls cascading around her face and shoulders. The curls are soft, bouncy, and well-defined with a natural-looking body and movement. The style achieves maximum volume while maintaining a polished, salon-quality finish.

Hair Texture: Texturized or lightly relaxed natural hair, set on large rollers or rod-set to create uniform, bouncy curls. The curl pattern is loose and open — approximately Type 3A-3B — with significant body and movement.

Product Use: Moisturizing setting lotion or mousse applied before roller set, a light hold finishing spray, and a shine serum for glossy definition. The curls have been carefully separated by hand (not brushed) to maintain definition while maximizing volume.

### II. Arrangement and Placement
The curls frame the face on both sides, with the most volume concentrated at the crown and mid-lengths. The curls fall naturally past the shoulders with soft, face-framing layers in the front. No visible parting — the volume creates an overall rounded, full silhouette.

Volume: High — maximum body and lift
Curl Size: Large to medium barrel curls
Length: Long (past shoulders)
Face Framing: Soft layers around the face
Finish: Semi-gloss, healthy sheen

### III. Technical Details
- Style Type: Voluminous Roller Set / Rod Set Curls
- Method: Large roller or flexi-rod set on damp, product-coated hair; air-dried or hooded dryer; hand-separated
- Complexity: Moderate
- Longevity: 3-5 days with proper nighttime wrapping
- Best For: Formal occasions, date nights, everyday glam
- Hair Requirement: Medium to long hair (relaxed, texturized, or natural with blowout)`,
    attributes: {
      hairType: 'curly',
      length: 'long',
      stylingTechnique: 'rod-set',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // ─── 5. Free-Form Locs Portrait (Locs) ───────────────────────────────
  {
    name: 'Shoulder-Length Free-Form Locs',
    category: 'Locs',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/5417793/pexels-photo-5417793.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 37,
    ai_description: `### Title: Shoulder-Length Free-Form Locs

### I. Style Foundation and Overall Structure
A warm, natural portrait of a Black woman with shoulder-length locs that fall freely around her face and shoulders. The locs are mature, well-maintained, and have a natural, organic quality — not overly manicured, giving them a free-form aesthetic with character and movement.

Hair Texture: Natural Type 4A-4C hair that has been locked/loc'd over an extended period. The locs show maturity with smooth, cylindrical formations that vary slightly in thickness, indicating a semi-freeform approach to maintenance.

Product Use: Minimal product — likely a light oil (such as jojoba or tea tree) for scalp moisture and loc maintenance spray. The locs appear clean from residue, indicating a water-based or low-product maintenance regimen.

### II. Arrangement and Placement
The locs hang naturally from the scalp, falling to shoulder length with a slight wave pattern from natural movement and sleeping patterns. They frame the face on both sides with some locs falling forward. No elaborate styling — the beauty is in the natural drape and texture of the locs themselves.

Loc Size: Medium thickness (pencil-width)
Loc Count: Approximately 60-80 locs
Length: Shoulder-length
Parting: Organic, irregular — reflecting the initial sectioning pattern
Volume: Medium — natural density
Movement: Free-flowing with natural wave

### III. Technical Details
- Style Type: Semi-Freeform Locs
- Loc Method: Likely started with two-strand twists or palm rolls, maintained with periodic retwisting
- Maturity: 2-4 years based on length and density
- Maintenance: Retwist every 4-8 weeks; wash every 1-2 weeks
- Complexity: Simple daily styling (the investment is in the years of growing)
- Cultural Significance: Locs carry deep spiritual and cultural meaning across African and African diaspora communities
- Best For: All face shapes; a lifestyle commitment to natural hair`,
    attributes: {
      hairType: 'locked',
      length: 'medium',
      stylingTechnique: 'palm-roll',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // ─── 6. Full Afro Studio Portrait (Afros) ────────────────────────────
  {
    name: 'Full Rounded Afro — Studio Portrait',
    category: 'Afros',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/19327682/pexels-photo-19327682.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 48,
    ai_description: `### Title: Full Rounded Afro — Studio Portrait

### I. Style Foundation and Overall Structure
A minimalist studio portrait of a Black woman with a full, rounded afro that is the centerpiece of the composition. The afro is symmetrically shaped, voluminous, and projects outward in a perfect sphere from the head, creating a bold and striking silhouette against the clean studio background.

Hair Texture: Natural Type 4B-4C coily/kinky hair, picked or blown out to maximum volume. The dense, tightly coiled texture provides the structure needed to hold the spherical shape without collapsing.

Product Use: A leave-in conditioner for moisture, a light oil (shea butter or coconut oil) for sheen, and possibly a light-hold styling foam for shape retention. The hair has been carefully picked out with an afro pick to achieve uniform density and shape.

### II. Arrangement and Placement
The afro extends evenly in all directions from the head — upward, outward at the sides, and backward — creating a perfectly rounded silhouette. The shape is symmetrical from all angles. No parting is visible; the dense coils form a unified mass. The hairline is natural and clean.

Shape: Spherical/rounded
Volume: Very high — maximum projection
Symmetry: Even distribution in all directions
Density: High — scalp not visible through the hair
Finish: Soft matte with subtle natural sheen
Face Framing: The afro encircles and frames the face

### III. Technical Details
- Style Type: Classic Full Afro (picked out)
- Method: Wash, condition, detangle, apply leave-in, blow-dry or stretch, pick out with afro pick
- Complexity: Simple in technique, but requires patience and care to achieve a perfect shape
- Longevity: Reshape daily with pick; refresh with water mist and oil
- Maintenance: Nightly pineapple or bonnet to preserve volume
- Cultural Significance: The afro has been a powerful symbol of Black pride, identity, and beauty since the 1960s civil rights movement
- Best For: Type 4A-4C natural hair; all face shapes`,
    attributes: {
      hairType: 'coily',
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

  // ─── 7. Natural Twists with Pink Earrings (Twists) ───────────────────
  {
    name: 'Two-Strand Twists with Side Sweep',
    category: 'Twists',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/30091514/pexels-photo-30091514.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 33,
    ai_description: `### Title: Two-Strand Twists with Side Sweep

### I. Style Foundation and Overall Structure
A warm, close-up portrait of a smiling Black woman with neatly done two-strand twists throughout her hair. The twists are medium-sized, uniform in thickness, and styled with a slight side sweep that gives the look movement and personality. Pink statement earrings add a pop of color.

Hair Texture: Natural Type 4A-4C coily hair, providing excellent grip and definition for the twist pattern. The natural texture ensures each twist holds its shape and maintains a clean, rope-like appearance.

Product Use: A twisting cream or butter applied to each section before twisting for definition and moisture. A light oil applied to the finished twists for sheen. The twists appear well-moisturized with minimal frizz, indicating quality product application.

### II. Arrangement and Placement
The twists are installed from front hairline to nape, with a slight side sweep in the front creating an asymmetrical look. Each twist is approximately the same thickness (pencil-width). The parting pattern follows a traditional grid/brick-lay section pattern for even distribution.

Twist Size: Medium (pencil-width)
Direction: Swept to one side in front, hanging naturally elsewhere
Length: Medium (chin to shoulder length)
Parting: Neat grid sections
Finish: Defined, rope-like texture with semi-gloss sheen
Coverage: Full head

### III. Technical Details
- Style Type: Two-Strand Twists
- Method: Section hair, apply twisting product, twist two strands around each other from root to tip
- Complexity: Simple to moderate — time-intensive but straightforward technique
- Longevity: 1-3 weeks with proper maintenance
- Versatility: Can be worn as-is or unraveled for a twist-out curl pattern
- Maintenance: Refresh with water and oil spray; sleep with silk bonnet
- Best For: Type 3C-4C natural hair; protective styling; everyday wear`,
    attributes: {
      hairType: 'twisted',
      length: 'medium',
      stylingTechnique: 'twist-out',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // ─── 8. Modern Textured Crop — Man (Modern) ──────────────────────────
  {
    name: 'Modern Textured Crop with Denim Jacket',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/6390060/pexels-photo-6390060.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 42,
    ai_description: `### Title: Modern Textured Crop with Denim Jacket

### I. Style Foundation and Overall Structure
A portrait of a young Black man with a clean, modern textured crop haircut — short on the sides with a slightly longer, textured top. The style is contemporary and effortlessly cool, complemented by a denim jacket that adds to the casual-modern aesthetic. Warm lighting highlights the hair's texture and shape.

Hair Texture: Natural Type 4A-4B coily hair, cut short and shaped to emphasize the natural curl pattern on top. The sides are tapered cleanly, creating contrast between the textured top and the faded/tapered sides.

Product Use: A light curl-defining cream or sponge treatment applied to the top section to enhance coil definition. The sides may have been clipper-cut with no product. A light sheen oil adds a healthy appearance.

### II. Arrangement and Placement
The hair on top is approximately 1-2 inches, styled to show defined coils and texture. The sides taper from the textured crown down to the skin or a very short length at the temple and above the ears. The hairline appears naturally shaped or lined up with a clean but not harsh edge.

Top Length: 1-2 inches (textured coils)
Side Length: Tapered/faded
Back: Tapered to match sides
Hairline: Natural or softly shaped
Volume: Low to medium on top
Finish: Matte/natural with slight sheen

### III. Technical Details
- Style Type: Textured Crop / Taper
- Method: Clipper taper on sides, scissor or clipper-over-comb on top, curl sponge or finger-coil for definition
- Complexity: Simple — requires a good barber for the initial cut
- Longevity: 2-3 weeks between cuts
- Maintenance: Daily moisture with water/oil, periodic sponge treatment for definition
- Best For: Type 3C-4C hair; professional settings, casual style, versatile everyday look`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'taper',
      hasLineup: true,
      stylingTechnique: 'natural',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // ─── 9. Bouncy Curly Bob (Bob) ───────────────────────────────────────
  {
    name: 'Voluminous Curly Bob',
    category: 'Bob',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/4355347/pexels-photo-4355347.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 44,
    ai_description: `### Title: Voluminous Curly Bob

### I. Style Foundation and Overall Structure
A studio portrait of a Black woman with a voluminous, curly bob that falls to chin-to-shoulder length. The curls are bouncy, well-defined, and full of body, creating an elegant yet playful silhouette. The style balances volume and structure — big enough to make a statement while maintaining a polished bob shape.

Hair Texture: Natural curly hair (Type 3A-3C) or a curly weave/wig that mimics this texture. The curls are medium-sized spirals with visible definition and bounce. The overall density is high, creating a full, luxurious appearance.

Product Use: A curl-enhancing cream or mousse for definition, a lightweight gel for hold without crunch, and a shine serum for a healthy, glossy finish. The curls appear diffused or air-dried rather than heat-styled.

### II. Arrangement and Placement
The bob is cut to a uniform length, approximately chin-to-shoulder length, with layers throughout to encourage curl spring and volume. The curls frame the face on both sides, with more volume at the sides and crown. The style appears to have a center or off-center part.

Length: Chin to shoulder (bob length)
Volume: High — full and bouncy
Curl Pattern: Medium spirals, approximately 3A-3C
Layers: Throughout for movement and spring
Parting: Center or slightly off-center
Finish: Glossy, defined curls with bounce

### III. Technical Details
- Style Type: Curly Bob
- Method: Wash-and-go technique with curl cream, diffuse dry, or flexi-rod set; cut into bob shape
- Complexity: Moderate — requires good curl technique and precision cutting
- Longevity: Refresh daily with water mist and curl cream; full restyle every 3-5 days
- Versatility: Can be pinned up, half-up, or worn as a full curly mane
- Best For: Type 3A-4A hair (natural or installed); oval, heart, and round face shapes`,
    attributes: {
      hairType: 'curly',
      length: 'medium',
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'center',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // ─── 10. Flat Top Fade (Fades) ───────────────────────────────────────
  {
    name: 'Flat Top Fade with Defined Shape',
    category: 'Fades',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/30558488/pexels-photo-30558488.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 46,
    ai_description: `### Title: Flat Top Fade with Defined Shape

### I. Style Foundation and Overall Structure
A bold, close-up portrait of a young Black man with a meticulously shaped flat top fade, photographed against a vibrant yellow background. The flat top is the signature element — the hair on top is cut to create a perfectly level, flat surface, while the sides are faded down cleanly. The geometric precision of the cut is the highlight.

Hair Texture: Natural Type 4B-4C kinky/coily hair, which is essential for a flat top. The dense, upright growth pattern of kinky hair allows barbers to sculpt the flat surface that gives this style its name.

Product Use: Minimal — possibly a light holding spray or pick-and-pat technique to maintain the flat shape. A light oil for scalp health. The hair's natural density and texture do most of the work.

### II. Arrangement and Placement
The top hair stands upright at approximately 2-3 inches in height and is cut to form a perfectly flat horizontal plane. The sides taper from the flat top down to a skin fade or low fade, creating a dramatic contrast between the boxy top and the clean sides. The lineup is sharp and precise.

Top: Flat, level surface — 2-3 inches high
Sides: Faded from top to skin/low length
Back: Tapered to match side fade
Lineup: Sharp, geometric — crisp at forehead, temples, and nape
Shape: Angular, boxy silhouette from the front; squared from the side
Finish: Matte, natural texture

### III. Technical Details
- Style Type: Flat Top Fade
- Method: Clipper fade on sides, flat top comb and clipper technique to sculpt the level surface
- Complexity: Intricate — requires a very skilled barber for precision
- Longevity: 1-2 weeks; needs regular lineup touch-ups
- Maintenance: Daily pick to maintain height; avoid sleeping directly on top
- Cultural Significance: Iconic Black men's hairstyle popularized in the late 1980s and early 1990s, experiencing modern revival
- Best For: Type 4A-4C hair; square, oval, and oblong face shapes`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4C',
      length: 'short',
      fadeType: 'high-fade',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'intricate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },
];

// ─── Seed runner ─────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  let created = 0;
  for (const style of newHairstyles) {
    const exists = await Hairstyle.findOne({ name: style.name });
    if (exists) {
      console.log(`⏭  "${style.name}" already exists — skipping`);
      continue;
    }

    // Upload to Cloudinary
    const slug = style.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
    console.log(`📤 Uploading "${style.name}" to Cloudinary...`);
    let thumbnail;
    try {
      thumbnail = await uploadToCloudinary(style.sourceUrl, slug);
    } catch (err) {
      console.error(`❌ Upload failed for "${style.name}":`, err.message);
      continue;
    }

    const doc = {
      name: style.name,
      category: style.category,
      gender: style.gender,
      thumbnail,
      ai_description: style.ai_description,
      attributes: style.attributes || {},
      attributesVersion: 1,
      price: style.price,
      popularity: style.popularity,
      isActive: true,
      generationCount: 0,
      averageRating: 0,
      isCustom: false,
    };

    await Hairstyle.create(doc);
    created++;
    console.log(`✅ Created "${style.name}" [${style.category}] → ${thumbnail}`);
  }

  console.log(`\nDone — ${created} new hairstyles seeded.`);
  const total = await Hairstyle.countDocuments({});
  console.log(`Total hairstyles in DB: ${total}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
