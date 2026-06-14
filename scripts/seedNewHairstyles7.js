/**
 * Seed batch 7 — 10 premium hairstyles with studio-quality Pexels images.
 * Targets under-represented categories based on current distribution (109 total):
 *   Fades(f): 1→3, Afros(m): 2→4, Modern(f): 2→4, Locs(m): 3→5,
 *   Relaxed(f): 4→5, Coils(m): 2→3
 * Run: cd /var/www/hairstudio && node scripts/seedNewHairstyles7.js
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
  // ─── 1. Sculpted Short Cut — Red Background (Fades – female) ────────
  {
    name: 'Sculpted Short Cut with Bold Pose',
    category: 'Fades',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/3025950/pexels-photo-3025950.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 44,
    ai_description: `### Title: Sculpted Short Cut with Bold Pose

### I. Style Foundation and Overall Structure
A fierce, editorial portrait of a confident Black woman wearing a white dress against a vibrant red background. The hairstyle is a precision-sculpted short cut — cropped close to the head and shaped to complement the structure of the face. The bold makeup and strong jawline are accentuated by the minimal hair framing. The style reads as high-fashion and deliberate.

Hair Texture: Natural Type 4A-4B hair cut extremely short, creating a velvety, uniform surface across the scalp. The natural coil pattern is visible at this minimal length, providing subtle texture without volume. The hair appears healthy and moisturized.

Product Use: A light pomade or styling wax for definition and sheen. Edges are shaped naturally. The finish is semi-matte with a hint of healthy shine, suggesting careful product selection.

### II. Arrangement and Placement
The hair sits uniformly close to the scalp, following the natural contours of the head. There is no defined parting — the hair is one continuous, closely cropped surface. The cut is precision-tapered at the nape and around the ears, blending into the skin for a seamless, polished look.

Length: Very short (buzz to 0.5 inches)
Volume: Flat — lies flush against the scalp
Shape: Follows natural head contour with subtle taper at edges
Parting: None
Finish: Semi-matte, healthy sheen
Edges: Clean, naturally shaped

### III. Technical Details
- Style Type: Women's Precision Fade / Sculpted Pixie
- Method: Clipper cut with fine guard, detail work around nape and temples with T-blade trimmer
- Fade Technique: Subtle taper from short on top to skin-fade at the nape
- Complexity: Moderate — requires skilled barber/stylist for the feminine shaping
- Longevity: Shape-up every 2-3 weeks
- Maintenance: Daily scalp moisturizer; minimal product needed
- Best For: Oval, heart, and diamond face shapes; women who want a bold, statement look`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'buzz',
      fadeType: 'taper',
      hasLineup: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'flat',
      partingPattern: 'none',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // ─── 2. Joyful Tapered TWA (Fades – female) ────────────────────────
  {
    name: 'Joyful Tapered TWA with Radiant Smile',
    category: 'Fades',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/3888426/pexels-photo-3888426.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 1,
    popularity: 46,
    ai_description: `### Title: Joyful Tapered TWA with Radiant Smile

### I. Style Foundation and Overall Structure
A warm, uplifting portrait of a joyful Black woman with a beautifully shaped teeny weeny afro (TWA) that frames her face perfectly. She radiates happiness and confidence, with the short tapered cut putting all focus on her bright smile and expressive eyes. The style is natural, effortless, and incredibly flattering.

Hair Texture: Natural Type 4B-4C kinky/coily hair at a very short length. The coils are visible and create a soft, velvety texture on the head. The hair is healthy-looking, moisturized, and well-maintained with a dense, uniform appearance across the crown.

Product Use: A leave-in conditioner or light butter for moisture, with possibly a light oil for sheen. The hair looks hydrated and soft. No heavy products — the natural texture shines through.

### II. Arrangement and Placement
The hair is evenly short across the top with a subtle taper at the sides and nape. The cut follows the natural head shape and enhances the facial features. The hairline is natural and clean. The overall silhouette is soft and rounded, adding femininity to the short length.

Length: Very short (0.5-1 inch)
Volume: Low to medium — the natural coils provide slight lift
Shape: Rounded, following head contour
Taper: Subtle fade at sides and nape
Finish: Natural matte with healthy sheen
Face Framing: The cut hugs the face, emphasizing cheekbones and eyes

### III. Technical Details
- Style Type: Tapered TWA (Teeny Weeny Afro)
- Method: Clipper cut with guards, tapered at sides; top shaped with scissors for soft roundness
- Fade Technique: Low taper at nape and temples, longer on top for texture
- Complexity: Simple to moderate
- Longevity: Shape-up every 2-3 weeks
- Maintenance: Daily moisture spritz, light oil, and go — a true wash-and-wear style
- Cultural Context: The TWA is a celebration of the big chop journey, embracing natural texture in its shortest, purest form
- Best For: All face shapes; especially flattering for round and oval faces`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B',
      length: 'short',
      fadeType: 'taper',
      hasLineup: false,
      stylingTechnique: 'tapered',
      volumeProfile: 'low',
      partingPattern: 'none',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'low-cut',
    },
  },

  // ─── 3. Side-Profile Studio Afro (Afros – male) ────────────────────
  {
    name: 'Studio Afro with Beard — Side Profile',
    category: 'Afros',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/7389094/pexels-photo-7389094.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 43,
    ai_description: `### Title: Studio Afro with Beard — Side Profile

### I. Style Foundation and Overall Structure
A striking side-profile studio portrait of a young Black man with a well-groomed medium afro, captured against a soft pink background. The hair extends naturally outward from the head in a rounded, organic shape. A full beard complements the hairstyle, creating a balanced, masculine aesthetic. The professional lighting highlights every curl and coil.

Hair Texture: Natural Type 3C-4A curly/coily hair, grown to medium length and styled in its natural state. The curls are loose enough to show defined spiral patterns at the outer edges while the interior is dense and full. The hair appears well-conditioned and bouncy.

Product Use: A curl cream or leave-in conditioner for definition, with a light oil for sheen and moisture retention. The afro has been lightly picked or finger-styled for shape, not over-manipulated. The result is a natural, touchable texture.

### II. Arrangement and Placement
The afro extends uniformly in all directions from the head, with a slightly rounded-to-oblong shape when viewed from the side. The hair is denser at the crown and slightly tapered near the ears. The sideburns blend naturally into a well-groomed beard, creating a continuous line from hair to facial hair.

Length: Medium (3-5 inches when stretched)
Volume: High — extends well past the ear line
Shape: Rounded, natural silhouette
Density: High, scalp barely visible
Beard: Full, well-groomed, complementing the afro
Finish: Natural sheen, defined curls visible at edges

### III. Technical Details
- Style Type: Medium Natural Afro with Full Beard
- Method: Wash, condition, apply curl cream, air dry or diffuse, lightly pick for shape
- Complexity: Simple — embrace and maintain the texture
- Longevity: Refresh every 2-3 days; reshape with pick as needed
- Maintenance: Weekly deep conditioning; silk durag or bonnet at night to preserve shape
- Beard Coordination: The beard and afro create a cohesive look — both should be conditioned and shaped together
- Best For: Type 3B-4B natural hair; oval, rectangular, and heart-shaped faces`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3C',
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

  // ─── 4. Pensive Afro Against Pink (Afros – male) ───────────────────
  {
    name: 'Pensive Afro with Soft Studio Light',
    category: 'Afros',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/7389003/pexels-photo-7389003.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 41,
    ai_description: `### Title: Pensive Afro with Soft Studio Light

### I. Style Foundation and Overall Structure
A contemplative studio portrait of a Black man with a substantial, well-maintained afro, captured against a pastel pink background with soft directional lighting. The hair forms a dramatic halo around the head, showcasing impressive natural volume and texture. The subject's pensive expression and casual stance let the hair take center stage.

Hair Texture: Natural Type 4A-4B coily hair, fully grown out and styled in its natural state. The coils are tight and densely packed, creating a solid mass of hair that holds its shape without external support. The texture is matte with natural highlights where the studio light catches raised coil tips.

Product Use: A leave-in conditioner and natural butter (shea or mango) for moisture and softness, with careful picking for fullness. The hair appears moisturized but not weighed down — an indication of well-balanced product application. No shine spray; the finish is authentically matte.

### II. Arrangement and Placement
The afro extends generously in all directions, creating a large, rounded silhouette that is wider than the shoulders. It is slightly higher at the crown, suggesting the top coils have been picked more for height. The shape is organic and naturally imperfect — this is a lived-in, real afro, not a perfectly sculpted one.

Length: Long (6-8 inches when stretched)
Volume: Very high — truly big afro territory
Shape: Large, rounded, slightly taller at crown
Density: Very dense — scalp not visible
Finish: Matte, natural
Movement: Minimal — the mass holds its shape

### III. Technical Details
- Style Type: Big Natural Afro
- Method: Detangle when wet, apply moisture products section by section, air dry completely, pick out with afro pick for maximum volume
- Complexity: Moderate — requires patience and commitment to grow and maintain
- Longevity: Daily shape maintenance with pick; deep condition weekly
- Shrinkage: At this length, stretched hair is 2-3x longer than the afro appears
- Cultural Significance: The big afro is a powerful symbol of natural beauty and pride
- Best For: Type 4A-4C hair with 6+ inches of growth; all face shapes, especially elongated faces where the width provides balance`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
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

  // ─── 5. Confident Short Curls with Jewelry (Modern – female) ───────
  {
    name: 'Confident Short Curls with Statement Jewelry',
    category: 'Modern',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/2747798/pexels-photo-2747798.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 45,
    ai_description: `### Title: Confident Short Curls with Statement Jewelry

### I. Style Foundation and Overall Structure
A glamorous studio portrait of a beautiful Black woman with a short, polished curly hairstyle, accessorized with striking statement jewelry. The hair is styled to perfection — short, defined curls that sit close to the head while maintaining visible texture and dimension. The look is sophisticated and modern, suitable for both everyday and evening occasions.

Hair Texture: Natural Type 3B-3C curly hair, cut short and defined with curl-enhancing products. The curls are spiraled, bouncy, and uniform in size, creating a polished yet natural appearance. The hair texture is smooth, well-moisturized, and frizz-free.

Product Use: A curl-defining gel or cream applied to wet hair and diffused for definition. A light oil sheen for healthy glow. Edges are laid with edge control for a polished, red-carpet-ready finish.

### II. Arrangement and Placement
The curls sit close to the head in a structured, intentional shape. The style features a soft side-sweep at the front, with curls slightly longer on top and shorter at the sides. The overall shape is a modern pixie-meets-curl look that is both edgy and feminine.

Length: Short (1-3 inches)
Volume: Low to medium — controlled, not wild
Curl Pattern: Defined spirals
Finish: Glossy, polished
Edge Treatment: Smoothly laid
Shape: Tapered sides, slightly longer top

### III. Technical Details
- Style Type: Modern Curly Pixie / Short Defined Curls
- Method: Cut in a tapered pixie shape; wash, apply curl cream gel, diffuse on low heat, arrange curls with fingers
- Complexity: Moderate — the cut determines the style; daily styling is quick
- Longevity: 2-3 days with pineapple method or silk bonnet at night
- Maintenance: Trim every 4-6 weeks; regular deep conditioning
- Styling Versatility: Can be finger-waved, slicked back for formal events, or worn naturally curly
- Best For: Type 3A-4A hair; all face shapes, particularly flattering on round and square faces`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3B',
      length: 'short',
      stylingTechnique: 'natural',
      volumeProfile: 'low',
      partingPattern: 'side-left',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // ─── 6. Textured Curls with Bare Shoulders (Modern – female) ───────
  {
    name: 'Textured Curls with Elegant Bare Shoulders',
    category: 'Modern',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/5157566/pexels-photo-5157566.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 42,
    ai_description: `### Title: Textured Curls with Elegant Bare Shoulders

### I. Style Foundation and Overall Structure
A stunning studio portrait of a Black woman with beautifully defined, medium-length curly hair, photographed with bare shoulders that put the hairstyle in full focus. The curls cascade softly around her face and neck, creating a romantic, modern aesthetic. The neutral background and soft lighting emphasize the hair's texture, volume, and healthy shine.

Hair Texture: Natural Type 3B-3C curly hair, grown to medium length with well-defined spiral curls throughout. The curl pattern is consistent and bouncy, with individual curl clumps visible. The hair looks incredibly healthy — hydrated, shiny, and elastic.

Product Use: A generous application of curl cream or custard on soaking-wet hair, followed by air-drying or diffusing. The curls show excellent clumping with minimal frizz, suggesting a well-executed wash-and-go routine with quality products. A light oil has been applied for added sheen.

### II. Arrangement and Placement
The curls fall naturally around the face, framing it softly on both sides. The hair reaches approximately chin to shoulder length, with some shrinkage from the curl pattern. Volume is greatest at the sides and crown, creating a soft, halo-like silhouette. The parting appears natural and slightly off-center.

Length: Medium (shoulder-length when stretched)
Volume: Medium-high, natural body from curl pattern
Shape: Soft, cascading, face-framing
Curl Definition: Excellent — individual spirals visible
Finish: Glossy, healthy sheen
Movement: Bouncy, with natural curl spring

### III. Technical Details
- Style Type: Defined Wash-and-Go / Natural Curly Style
- Method: Wash, condition with rich conditioner, apply curl cream to soaking-wet hair in sections, scrunch, air-dry or diffuse
- Complexity: Simple to moderate — technique matters more than time
- Longevity: Refresh with water mist and light product for 3-5 days
- Maintenance: Deep condition weekly; trim ends every 8-12 weeks to maintain curl health
- Night Routine: Pineapple or silk bonnet to preserve curl definition
- Best For: Type 3A-4A curly hair; all face shapes, especially heart and oval`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3B',
      length: 'medium',
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'simple',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // ─── 7. Close-Up Dreadlocks — Thoughtful Gaze (Locs – male) ───────
  {
    name: 'Thick Locs with Contemplative Gaze',
    category: 'Locs',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/1413051/pexels-photo-1413051.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 44,
    ai_description: `### Title: Thick Locs with Contemplative Gaze

### I. Style Foundation and Overall Structure
A powerful close-up portrait of a Black man with thick, mature dreadlocks that fall past his shoulders. The image captures the intricate detail and natural beauty of well-established locs. The subject's thoughtful, direct gaze and the dark, moody lighting create a striking emotional portrait where the locs become a defining feature of identity and self-expression.

Hair Texture: Natural Type 4A-4C hair that has been locked for several years, resulting in thick, smooth, well-formed cylinders. Each loc is approximately finger-width and shows the characteristic smoothness of mature locs. Some locs show slight color variation — natural dark brown to black — adding depth and dimension.

Product Use: Minimal — light oil (jojoba or coconut) for scalp health and loc sheen. The locs appear clean and well-maintained with no visible lint or buildup. The finish is natural with a subtle sheen from the oils.

### II. Arrangement and Placement
The locs fall freely around the face and over the shoulders, with some gathered and some draped forward. The arrangement is organic and unforced — these locs have found their natural resting positions over years of growth. They vary slightly in thickness, a sign of authentic, natural loc formation.

Loc Size: Medium to thick (finger-width)
Length: Long (past shoulders)
Maturity: Advanced — 4-6+ years
Density: High — full coverage
Movement: Heavy, draping naturally
Color: Natural dark brown/black
Finish: Natural matte with subtle oil sheen

### III. Technical Details
- Style Type: Mature Freeform / Palm-Roll Locs
- Starting Method: Likely two-strand twists or palm rolls, now fully matured and locked
- Maturity: Fully locked — individual hair strands have completely interlocked within each loc
- Maintenance: Retwist or interlock new growth every 4-8 weeks; wash with residue-free shampoo every 1-2 weeks
- Complexity: Low daily effort; high time investment (years of growth)
- Versatility: Can be worn down, in a bun, ponytail, or half-up style
- Cultural Significance: Locs are deeply rooted in African and Caribbean culture, symbolizing spiritual growth, patience, and natural beauty
- Best For: All hair types 3C-4C; a lifestyle commitment to a journey of growth`,
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

  // ─── 8. Bearded Man with Short Twists (Locs – male) ────────────────
  {
    name: 'Short Starter Locs with Groomed Beard',
    category: 'Locs',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/20514563/pexels-photo-20514563.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 40,
    ai_description: `### Title: Short Starter Locs with Groomed Beard

### I. Style Foundation and Overall Structure
A detailed close-up portrait of a Black man with short starter locs or two-strand twists, captured against a clean neutral background. The hairstyle is in its early stages of locking — the twists are well-formed, uniform, and meticulously maintained. A well-groomed beard complements the hairstyle, creating a polished, modern masculine look.

Hair Texture: Natural Type 4A-4B coily hair styled in two-strand twists that are beginning to lock. Each twist is tight and well-defined, showing fresh maintenance. The texture on the surface of each twist shows the natural coil pattern before it fully matures into a smooth loc.

Product Use: A twisting cream or loc butter applied to each section before twisting, providing hold and moisture. A light oil at the roots for scalp health. The twists have a clean, well-maintained appearance with no frizz or flyaways.

### II. Arrangement and Placement
The twists cover the entire head in a uniform pattern, with clean partings visible between each twist section. They are approximately 2-4 inches long and stand slightly upright or curl over due to their short length. The sections are small to medium, creating a dense, textured crown.

Twist Size: Small to medium
Length: Short (2-4 inches)
Parting: Clean, rectangular grid pattern
Density: Full coverage, dense
Direction: Varied — some upright, some draping slightly
Beard: Full, groomed, complementing the maturing locs
Finish: Semi-matte, well-moisturized

### III. Technical Details
- Style Type: Starter Locs / Two-Strand Twist Locs
- Method: Section hair into small-to-medium squares, apply twisting cream, two-strand twist each section; maintain with retwists every 3-4 weeks
- Locking Stage: Budding to teen stage — twists are beginning to matt and lock but haven't fully matured
- Complexity: Moderate — requires patience in the starter phase
- Longevity: Retwist every 3-4 weeks; will mature into full locs over 1-2 years
- Maintenance: Avoid unraveling; sleep with durag or silk bonnet; wash carefully with stocking cap method
- Journey: This is the beginning of a loc journey — the most challenging phase where patience is key
- Best For: Type 3C-4C hair; men who want to start locs while maintaining a polished appearance`,
    attributes: {
      hairType: 'twisted',
      hairTexture: '4A',
      length: 'short',
      stylingTechnique: 'palm-roll',
      volumeProfile: 'low',
      partingPattern: 'geometric',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // ─── 9. Elegant Relaxed Style — Gloved Portrait (Relaxed – female) ─
  {
    name: 'Elegant Relaxed Waves with White Gloves',
    category: 'Relaxed',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/36980782/pexels-photo-36980782.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 43,
    ai_description: `### Title: Elegant Relaxed Waves with White Gloves

### I. Style Foundation and Overall Structure
A classically elegant portrait of a beautiful Black woman in a refined pose, wearing white gloves and leaning gracefully on a reflective surface. Her hair is styled in sleek, relaxed waves that frame her face with old-Hollywood glamour. The entire composition exudes sophistication and grace, with the smooth, flowing hair as a central element of the look.

Hair Texture: Chemically relaxed or heat-straightened natural hair, resulting in smooth, flowing waves with body and movement. The hair has been set in large, soft waves that create a cascading S-pattern. The texture is silky, smooth, and luminous — a salon-quality finish.

Product Use: A heat protectant and smoothing serum before styling, followed by a large-barrel curling iron or roller set for the waves. A light-hold finishing spray maintains the wave pattern while allowing movement. A shine spray adds the final glossy finish.

### II. Arrangement and Placement
The hair is parted slightly off-center, with waves cascading on both sides of the face. The waves start at approximately ear level — the roots to mid-length are smoother, creating a sleek foundation. The wave pattern becomes more pronounced toward the ends, creating volume and drama at the shoulders.

Length: Medium to long (past shoulders)
Volume: Medium — smooth at roots, voluminous waves at ends
Parting: Slightly off-center
Wave Pattern: Large, softly defined S-waves
Finish: High-gloss, luminous
Movement: Flowing, with natural bounce

### III. Technical Details
- Style Type: Relaxed Vintage Waves / Old-Hollywood Glam
- Method: Relaxed or flat-ironed base; set with large-barrel curling iron or hot rollers; brush out for soft waves; finish with serum and shine spray
- Complexity: Moderate to intricate — achieving this polished wave pattern requires styling skill
- Longevity: 3-5 days with careful wrapping at night
- Maintenance: Wrap in silk scarf nightly; avoid humidity; touch up with curling iron as needed
- Occasion: Red carpet, formal events, bridal styling, editorial shoots
- Best For: Relaxed or heat-straightened hair; all face shapes, especially oval and square`,
    attributes: {
      hairType: 'straight',
      length: 'long',
      stylingTechnique: 'flat-iron',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'intricate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // ─── 10. Outdoor Natural Coils — Young Man (Coils – male) ──────────
  {
    name: 'Natural Coils with Outdoor Confidence',
    category: 'Coils',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/2589120/pexels-photo-2589120.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 2,
    popularity: 42,
    ai_description: `### Title: Natural Coils with Outdoor Confidence

### I. Style Foundation and Overall Structure
A natural, lifestyle portrait of a young Black man with defined, medium-length coils, photographed outdoors with soft natural lighting. He leans casually against a hedge, wearing a black shirt, exuding relaxed confidence. The hair is the standout feature — a crown of well-defined, springy coils that showcase natural hair texture at its finest.

Hair Texture: Natural Type 3C-4A curly/coily hair, grown to medium length with excellent curl definition. The coils are tight, springy, and bouncy, with a visible spiral pattern. Each coil cluster is defined and separate, suggesting a careful styling routine that maximizes curl definition.

Product Use: A leave-in conditioner for base moisture, followed by a curl-defining cream or gel for hold and definition. The hair was likely styled with the finger-coil method or a curl sponge on damp hair, then air-dried for maximum definition. A light oil adds the finishing sheen.

### II. Arrangement and Placement
The coils are concentrated on the top and crown, with the sides possibly tapered or naturally shorter. The coils have upward and outward movement, creating a textured, voluminous crown. The definition is consistent throughout, with each coil maintaining its spiral shape.

Length: Medium (3-5 inches when stretched)
Volume: Medium-high — natural spring in the coils creates lift
Shape: Textured crown with natural tapering
Curl Definition: High — individual coils clearly visible
Finish: Semi-glossy, healthy natural sheen
Movement: Springy, bouncy coils with life

### III. Technical Details
- Style Type: Defined Natural Coils / Coil-Out
- Method: Apply curl cream to damp, detangled hair; define with finger-coils or curl sponge; air-dry or diffuse
- Complexity: Moderate — the definition technique requires patience section by section
- Longevity: 3-5 days with silk durag or bonnet at night; refresh with water mist and light cream
- Maintenance: Regular deep conditioning every 1-2 weeks; trim as needed for shape
- Styling Versatility: Can be worn as coils, picked out for an afro, or pushed back with a headband
- Best For: Type 3B-4B hair; men who want to showcase their natural curl pattern with a modern, defined finish`,
    attributes: {
      hairType: 'curly',
      hairTexture: '3C',
      length: 'medium',
      stylingTechnique: 'finger-coils',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'moderate',
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
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
