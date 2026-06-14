/**
 * Seed batch 6 — 10 premium hairstyles with studio-quality Pexels images.
 * Targets under-represented categories based on current distribution:
 *   Modern(f): 1→2, Afros(f): 3→5, Coils(m): 1→2, Locs(f): 3→4,
 *   Fashion(f): 4→5, Protective(f): 5→6, Straight(f): 4→5, Low Cut(m): 5→6
 * Run: cd /var/www/hairstudio && node scripts/seedNewHairstyles6.js
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
  // ─── 1. Sleek Modern Cut with Red Lips (Modern – female) ────────────
  {
    name: 'Sleek Modern Pixie with Bold Makeup',
    category: 'Modern',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/4547693/pexels-photo-4547693.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 42,
    ai_description: `### Title: Sleek Modern Pixie with Bold Makeup

### I. Style Foundation and Overall Structure
A striking close-up portrait of a young Black woman with a modern, closely cropped hairstyle that sits sleek against the scalp. The style is minimalist and fashion-forward, emphasizing the shape of the head and the contours of the face. Bold red lips and flawless makeup elevate the overall editorial feel.

Hair Texture: Natural Type 4A-4B hair that has been cut very short and shaped close to the head. The texture is visible but controlled, with a soft, velvety finish that highlights the natural curl pattern at a minimal length.

Product Use: A light pomade or edge control for a smooth, defined finish. The hair lies flat against the scalp with a natural matte finish — no excessive shine. Edges appear clean and naturally shaped.

### II. Arrangement and Placement
The hair is uniformly short all around — a modern pixie or TWA (teeny weeny afro) that follows the natural contour of the head. There is no visible parting. The hairline is natural and clean, framing the forehead and temples. The overall silhouette is smooth and rounded.

Length: Very short (under 1 inch)
Volume: Low — lies close to the scalp
Shape: Follows the natural head shape
Parting: None
Finish: Soft matte, velvety texture
Hairline: Natural, clean

### III. Technical Details
- Style Type: Modern Pixie / TWA (Teeny Weeny Afro)
- Method: Precision clipper cut, shaped with guards for even length
- Complexity: Simple — the cut does the work
- Longevity: Shape-up every 2-3 weeks to maintain clean lines
- Maintenance: Daily moisture with water and light oil; minimal product needed
- Best For: All face shapes; especially flattering on oval and heart-shaped faces
- Styling Note: This style puts the focus on facial features and accessories — makeup and earrings become the statement`,
    attributes: {
      hairType: 'coily',
      length: 'short',
      stylingTechnique: 'natural',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // ─── 2. Joyful Afro with Hoop Earrings (Afros – female) ─────────────
  {
    name: 'Joyful Medium Afro with Hoop Earrings',
    category: 'Afros',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/13356835/pexels-photo-13356835.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 44,
    ai_description: `### Title: Joyful Medium Afro with Hoop Earrings

### I. Style Foundation and Overall Structure
A vibrant, colorful portrait of a joyful Nigerian woman with a medium-sized afro that frames her face with beautiful natural volume. The afro is well-shaped and maintained, with a slightly rounded silhouette that adds softness. Gold hoop earrings and a colorful dress enhance the celebratory, confident aesthetic.

Hair Texture: Natural Type 4A-4B coily/kinky hair, grown out to medium length and styled in its natural state. The coils are defined but not overly manipulated — a wash-and-go or lightly picked-out approach. The texture is dense and springy with natural sheen.

Product Use: A leave-in conditioner for moisture and definition, possibly a light curl cream to encourage coil clumping and reduce frizz. A light oil (coconut or argan) for added sheen. The hair looks healthy, moisturized, and bouncy.

### II. Arrangement and Placement
The afro extends naturally outward from the head, with slightly more volume at the sides and crown. It frames the face on both sides, falling to approximately ear-to-chin level. The shape is organic and slightly asymmetrical — natural rather than perfectly sculpted. No visible parting.

Shape: Rounded, naturally organic
Volume: Medium-high
Length: Medium (ear to chin when stretched)
Density: High natural density
Face Framing: Soft, natural frame around face
Finish: Natural sheen, defined coils visible

### III. Technical Details
- Style Type: Medium Afro (natural wash-and-go)
- Method: Wash, condition, apply leave-in and curl cream, air dry or diffuse, lightly pick for volume
- Complexity: Simple — embrace the natural texture
- Longevity: Refresh every 2-3 days with water mist and oil
- Maintenance: Weekly deep conditioning; sleep with silk bonnet
- Cultural Context: The natural afro celebrates unprocessed Black hair in its authentic form
- Best For: Type 3C-4C natural hair; oval, round, and heart-shaped faces`,
    attributes: {
      hairType: 'coily',
      length: 'medium',
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // ─── 3. Men's Textured Coils (Coils – male) ─────────────────────────
  {
    name: 'Defined Textured Coils — Men\'s',
    category: 'Coils',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/7116213/pexels-photo-7116213.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 40,
    ai_description: `### Title: Defined Textured Coils — Men's

### I. Style Foundation and Overall Structure
A stylish portrait of a young Black man with well-defined textured coils on top, styled with intention and care. He is touching his hair confidently, showcasing the defined coil pattern from a slightly angled perspective. The background is soft and blurred, putting full focus on the hair texture and his confident expression.

Hair Texture: Natural Type 4A-4B coily hair, grown to approximately 2-4 inches on top and likely tapered or kept shorter on the sides. The coils are defined and well-moisturized, with visible individual curl groupings. The texture is springy and voluminous.

Product Use: A curl-defining cream or twisting butter applied to damp hair, then styled with a sponge or finger-coiled for definition. A light oil sealant for sheen. The coils hold their shape with defined separation — not frizzy, indicating good product application.

### II. Arrangement and Placement
The coils are concentrated on top of the head, with the longest coils at the crown. The hair appears to be longer on top and shorter at the sides (tapered or faded), creating a modern contrast. The coils stand upright and outward, creating a textured crown of volume.

Top Length: 2-4 inches (coiled)
Side Length: Shorter, tapered
Coil Definition: High — individual coils visible
Volume: Medium-high on top
Shape: Soft, textured crown
Finish: Semi-matte with natural sheen

### III. Technical Details
- Style Type: Defined Coils / Coil-Out
- Method: Apply curl cream to damp hair, use curl sponge in circular motion or finger-coil individual sections, air dry
- Complexity: Moderate — requires patience for definition
- Longevity: 3-5 days; refresh with water mist and light product
- Maintenance: Regular moisturizing; satin pillowcase or durag at night
- Best For: Type 3C-4B hair; men who want to showcase natural texture with a modern edge`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'short',
      stylingTechnique: 'finger-coils',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // ─── 4. Joyful Locs in the Park (Locs – female) ─────────────────────
  {
    name: 'Sun-Kissed Locs with Joyful Smile',
    category: 'Locs',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/30160184/pexels-photo-30160184.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 39,
    ai_description: `### Title: Sun-Kissed Locs with Joyful Smile

### I. Style Foundation and Overall Structure
A warm, natural photograph of a joyful woman enjoying a pleasant day in the park, with her locs cascading naturally around her face and shoulders. The locs are mature and well-maintained, with a free-flowing, organic quality. The warm outdoor lighting highlights the hair's natural color variations and gives the locs a sun-kissed quality.

Hair Texture: Natural Type 4A-4C hair that has been locked over a substantial period. The locs are mature — smooth, well-formed cylinders of various sizes. Some locs show natural color lightening at the tips from sun exposure, adding dimension and character.

Product Use: Minimal — light oil for scalp health and a rosewater or loc mist for freshness. The locs appear clean, lint-free, and well-maintained with a natural matte-to-semi-sheen finish.

### II. Arrangement and Placement
The locs fall naturally, framing the face on both sides with some falling forward over the shoulders. The length is approximately mid-back, indicating several years of growth. The locs vary slightly in thickness but are generally uniform, suggesting palm-roll or interlocking maintenance.

Loc Size: Medium (pencil to marker width)
Length: Long (mid-back)
Parting: Natural, organic sections
Volume: Medium — natural density
Movement: Free-flowing with natural wave from settling
Color: Natural black with subtle brown highlights from sun exposure
Finish: Natural matte

### III. Technical Details
- Style Type: Mature Freeform/Palm-Roll Locs
- Starting Method: Likely two-strand twists or palm rolls
- Maturity: 3-5+ years based on length and density
- Maintenance: Retwist every 4-8 weeks; wash every 1-2 weeks with residue-free shampoo
- Complexity: Low daily styling; the investment is in the journey
- Cultural Significance: Locs represent patience, spiritual growth, and connection to African heritage across many cultures
- Best For: All hair types 3C-4C; a lifestyle commitment to natural beauty`,
    attributes: {
      hairType: 'locked',
      length: 'long',
      stylingTechnique: 'palm-roll',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // ─── 5. Elegant Side-Profile Braids (Fashion – female) ──────────────
  {
    name: 'Elegant Side-Swept Braids with Gold Earring',
    category: 'Fashion',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/34628927/pexels-photo-34628927.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 46,
    ai_description: `### Title: Elegant Side-Swept Braids with Gold Earring

### I. Style Foundation and Overall Structure
A dramatic side-profile portrait of a woman with intricate braids and an ornate gold earring, captured against a dark background. The braids are meticulously done, sweeping back from the forehead and falling elegantly past the shoulders. The editorial lighting creates depth and dimension in the braided texture, highlighting every rope-like strand.

Hair Texture: Natural hair braided into medium-sized, uniform three-strand plaits. The braids are tight at the roots with clean, precise sectioning, and the braid pattern is consistent throughout — showcasing expert technique.

Product Use: Edge gel for a polished hairline, a light mousse or braiding foam applied before braiding for a smooth finish, and a shine spray for the final look. The braids have a semi-glossy finish with zero flyaways.

### II. Arrangement and Placement
The braids flow from front to back, following the natural contour of the head. From the side profile, they create an elegant cascade that drapes over the shoulder. The hairline is clean and the edges are softly laid. The ornate gold earring adds a high-fashion accent.

Braid Size: Medium (index finger width)
Direction: Front-to-back, cascading down
Length: Long (past shoulders)
Sectioning: Clean, uniform rectangular sections
Finish: Semi-gloss, smooth
Edge Treatment: Laid, polished

### III. Technical Details
- Style Type: Medium Box Braids / Feed-In Braids — Editorial Styling
- Method: Three-strand braiding with possible extension hair for length and fullness; feed-in technique for natural-looking hairline
- Complexity: Intricate — 4-6 hours installation time
- Longevity: 4-8 weeks with proper maintenance
- Maintenance: Wrap in silk scarf nightly; mousse edges every 2-3 days; wash scalp bi-weekly
- Versatility: Can be worn down, in a bun, half-up, or ponytail
- Best For: All hair types; particularly stunning for editorial and formal occasions`,
    attributes: {
      hairType: 'braided',
      length: 'long',
      stylingTechnique: 'box-braid',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'intricate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // ─── 6. Braided Updo with Decorative Pins (Protective – female) ─────
  {
    name: 'Braided Updo with Decorative Hairpins',
    category: 'Protective',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/31065905/pexels-photo-31065905.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 3,
    popularity: 43,
    ai_description: `### Title: Braided Updo with Decorative Hairpins

### I. Style Foundation and Overall Structure
A detailed close-up view of a stylish braided updo adorned with decorative gold hairpins. The braids are gathered and pinned into an elegant upswept arrangement that sits on top and at the back of the head. The decorative pins add a touch of glamour, transforming a practical protective style into a statement look.

Hair Texture: Natural hair braided into multiple medium-to-small braids, then arranged into an updo. The braids are smooth, tight, and uniform in size, indicating skilled braiding technique. Extensions may be incorporated for added length and fullness in the updo.

Product Use: Braiding gel or mousse for smooth braid creation, edge control for the hairline, and holding spray for the updo structure. The decorative pins serve both aesthetic and functional purposes, holding the arrangement in place.

### II. Arrangement and Placement
Multiple braids are swept upward from the nape and sides, then arranged in a sculptural pattern on the crown. The braids interweave and cross over each other, secured with decorative gold pins at strategic points. The result is an architectural, three-dimensional hairstyle.

Base Style: Medium cornrows or box braids
Updo Position: Crown and back of head
Height: Medium — elegant lift without excessive height
Pins: Gold decorative hairpins at 3-4 points
Edges: Smooth, laid
Nape: Clean, braids swept upward

### III. Technical Details
- Style Type: Braided Updo / Protective Upstyle
- Method: Braid hair into multiple sections, then pin into updo arrangement using bobby pins and decorative accessories
- Complexity: Intricate — requires both braiding skill and updo architectural sense
- Longevity: 1-2 weeks for the updo; underlying braids last 4-6 weeks
- Best For: Formal events, weddings, professional settings; Type 3C-4C hair
- Protective Benefits: Ends are tucked away, reducing breakage and environmental damage
- Cultural Context: Braided updos have been central to African bridal and ceremonial styling for centuries`,
    attributes: {
      hairType: 'braided',
      length: 'long',
      stylingTechnique: 'feed-in-braid',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'intricate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // ─── 7. Vibrant Afro with Red Top (Afros – female) ──────────────────
  {
    name: 'Voluminous Afro with Red Off-Shoulder',
    category: 'Afros',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/14093494/pexels-photo-14093494.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 47,
    ai_description: `### Title: Voluminous Afro with Red Off-Shoulder

### I. Style Foundation and Overall Structure
A bold studio portrait of a Black woman with a large, voluminous afro, wearing a vibrant red off-shoulder top. The afro is the star of the image — a massive, beautiful cloud of natural hair that commands attention. The studio setting with professional lighting captures every detail of the hair's texture and volume.

Hair Texture: Natural Type 4B-4C kinky/coily hair, fully picked out and fluffed for maximum volume. The texture is dense, tightly coiled, and opaque — creating a solid, dramatic silhouette. Individual coil clusters are visible on the outer edges.

Product Use: A leave-in conditioner and butter or cream for moisture and softness, then a thorough pick-out with a wide-toothed pick and afro comb for volume. A light sheen spray may be applied for a healthy glow without weighing down the hair.

### II. Arrangement and Placement
The afro extends dramatically outward in all directions — a large, rounded shape that is wider than the shoulders. It is slightly denser at the crown and tapers organically at the bottom edges. The face is beautifully framed by the mass of hair, creating a powerful, regal silhouette.

Shape: Large rounded/spherical
Volume: Very high — extends well past shoulders width
Density: Very high, scalp not visible
Face Framing: Dramatic encirclement
Finish: Matte with healthy natural sheen
Movement: Minimal — holds its shape

### III. Technical Details
- Style Type: Full-Volume Big Afro
- Method: Thoroughly detangle, apply moisture products, blow-dry on low heat for stretch, pick out sections methodically with afro pick
- Complexity: Moderate — requires patience and technique for uniform volume
- Longevity: Re-pick daily; deep condition weekly
- Shrinkage Factor: This style represents 50-70% stretch of the natural length — massive shrinkage when wet
- Cultural Significance: The big afro is the ultimate symbol of natural hair pride and Black beauty
- Best For: Type 4A-4C hair with sufficient length (8+ inches stretched); all face shapes`,
    attributes: {
      hairType: 'coily',
      length: 'long',
      stylingTechnique: 'natural',
      volumeProfile: 'very-high',
      partingPattern: 'none',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // ─── 8. Cheerful Thin Cornrows (Braids – female) ────────────────────
  {
    name: 'Long Thin Cornrows with Natural Smile',
    category: 'Braids',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/5309723/pexels-photo-5309723.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 41,
    ai_description: `### Title: Long Thin Cornrows with Natural Smile

### I. Style Foundation and Overall Structure
A cheerful, warm portrait of a young Black woman with long, thin cornrow braids that extend past her shoulders. She is smiling brightly with her hands at her chin, radiating happiness and confidence. The cornrows are neatly done with precise, uniform plaits that flow straight back from the hairline.

Hair Texture: Natural hair braided into thin cornrows with possible extension hair incorporated for added length. The braids are tight, smooth, and consistent in size from root to tip. The scalp is visible between the rows, showing clean, straight partings.

Product Use: Braiding gel or foam applied before braiding for smooth results, edge control for a polished hairline. The braids have a natural to semi-sheen finish, and the scalp appears moisturized.

### II. Arrangement and Placement
The cornrows run in a straight-back pattern from the front hairline to the nape, then continue as free-hanging braids past the shoulders. Each cornrow is thin (approximately pinky-finger width) with uniform spacing between rows. The pattern is classic and symmetrical.

Braid Type: Feed-in cornrows (thin)
Direction: Straight back from hairline
Row Count: Approximately 15-20 rows
Length: Long (past shoulders)
Spacing: Even, narrow partings
Finish: Smooth, glossy braids
Edges: Clean, natural

### III. Technical Details
- Style Type: Thin Straight-Back Cornrows with Extensions
- Method: Feed-in cornrow technique — starting thin at the hairline and gradually adding extension hair for seamless, natural-looking roots
- Complexity: Intricate — 4-8 hours; thin rows require more precision and time
- Longevity: 3-6 weeks with proper care
- Maintenance: Wrap in silk scarf nightly; moisturize scalp with oil every 2-3 days; wash carefully with diluted shampoo
- Protective Benefits: Excellent protection for natural hair; low daily manipulation
- Best For: All hair types; versatile for casual and professional settings`,
    attributes: {
      hairType: 'braided',
      length: 'long',
      stylingTechnique: 'cornrow',
      volumeProfile: 'flat',
      partingPattern: 'geometric',
      complexity: 'intricate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // ─── 9. Men's Clean Fade with Modern Fashion (Low Cut – male) ───────
  {
    name: 'Clean Fade with Sharp Lineup',
    category: 'Low Cut',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/14917484/pexels-photo-14917484.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 1,
    popularity: 45,
    ai_description: `### Title: Clean Fade with Sharp Lineup

### I. Style Foundation and Overall Structure
A portrait of a handsome young Black man with a clean, sharp fade haircut against a dark background. The cut is modern and meticulously executed — a testament to expert barbering. The style showcases a seamless fade from the temples to a short textured top, with a crisp lineup that defines the forehead and temples.

Hair Texture: Natural Type 4A-4B coily hair, with the top kept at approximately 0.5-1 inch and the sides faded down to skin. The texture on top shows tight, defined coils that create a subtle, controlled texture contrast with the smooth fade.

Product Use: Minimal — a light wave or curl cream on top for definition, with no product on the faded sides. The lineup appears to have been done with a straight razor for maximum precision.

### II. Arrangement and Placement
The hair transitions seamlessly from a short textured top to a mid-to-skin fade on the sides and back. The lineup is sharp and geometric at the forehead, creating a clean, defined frame for the face. The fade gradient is smooth with no visible clipper lines.

Top Length: 0.5-1 inch
Fade Type: Mid fade to skin
Lineup: Sharp, geometric — forehead and temples
Back: Tapered to match side fade
Texture on Top: Visible natural coils
Finish: Matte/natural

### III. Technical Details
- Style Type: Mid Fade with Textured Top
- Method: Clipper fade using multiple guard sizes for seamless gradient; straight razor lineup; top textured with shears
- Complexity: Moderate — requires skilled barber
- Longevity: 1-2 weeks before needing a touch-up
- Maintenance: Light oil daily; wave cap or durag at night for top texture
- Best For: All face shapes; professional and casual settings
- Barber Note: The quality of the fade gradient is the hallmark of this cut — a good barber makes it invisible`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'mid-fade',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // ─── 10. Sleek Relaxed Style with Warm Smile (Straight – female) ────
  {
    name: 'Polished Relaxed Straight with Side Part',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/2997545/pexels-photo-2997545.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 43,
    ai_description: `### Title: Polished Relaxed Straight with Side Part

### I. Style Foundation and Overall Structure
A warm studio portrait of a beautiful Black woman with polished, straightened hair styled in a classic side-parted bob-to-shoulder-length cut. She is smiling warmly, radiating elegance and approachability. The hair is smooth, sleek, and bouncy with a salon-fresh quality. The ends are curled slightly inward, creating a classic, timeless silhouette.

Hair Texture: Relaxed or flat-ironed natural hair, resulting in a smooth, straight finish. The hair has body and movement, suggesting a professional blowout and flat-iron treatment rather than a heavy chemical relaxer. The texture is silky with a healthy shine.

Product Use: Heat protectant applied before flat-ironing, a smoothing serum for frizz control, and a light-hold finishing spray for movement and shine. The ends are wrapped or curled under with a round brush or flat iron.

### II. Arrangement and Placement
The hair is parted on the side, with the larger section sweeping across the forehead. It falls to approximately shoulder length with a slight inward curl at the ends. The style has volume at the roots — not flat against the head — giving it lift and body. The overall shape is a classic layered bob or lob.

Length: Shoulder-length (lob)
Volume: Medium — lifted at roots, smooth through lengths
Parting: Deep side part
End Treatment: Curled slightly inward
Layers: Subtle layers for movement
Finish: High-gloss, silky

### III. Technical Details
- Style Type: Relaxed/Flat-Ironed Shoulder-Length Style with Side Part
- Method: Blow-dry with round brush for volume, flat-iron in sections for smoothness, curl ends under with iron, finish with serum
- Complexity: Moderate — requires heat styling skill for a smooth, bouncy result
- Longevity: 5-7 days with wrapping at night; humidity is the enemy
- Maintenance: Wrap hair in silk scarf nightly; avoid moisture; touch up with flat iron as needed
- Best For: Professional settings, date nights, everyday elegance; all face shapes
- Caution: Regular heat styling requires consistent use of heat protectant and deep conditioning`,
    attributes: {
      hairType: 'straight',
      length: 'medium',
      stylingTechnique: 'flat-iron',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
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
