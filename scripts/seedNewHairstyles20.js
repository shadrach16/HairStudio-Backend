/**
 * Batch 20 Seed Script — 10 new NON-AFRICAN hairstyles
 * DB before: ~279 total | Target after: ~289
 *
 * Category / Gender distribution:
 *   Low Cut (f) x1   | Bob (m) x1      | Fashion (f) x1
 *   Protective (f) x1| Fashion (m) x1  | Fades (m) x1
 *   Straight (m) x1  | Traditional (f) x1 | Straight (f) x1
 *   Modern (m) x1
 *
 * All images sourced from Pexels (free license).
 * Each image verified for quality, clarity, and hairstyle visibility.
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
  // 1 — Low Cut (female) — Platinum blonde buzz cut, dark studio background
  {
    name: 'Platinum Blonde Buzz Cut with Subtle Lavender Tones',
    category: 'Low Cut',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/590479/pexels-photo-590479.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 72,
    ai_description: `### Title: Platinum Blonde Buzz Cut with Subtle Lavender Tones

### Overview
An ultra-short platinum blonde buzz cut worn with confidence and elegance. The hair is cropped uniformly close to the scalp, approximately half an inch in length, with an icy blonde color that hints at subtle lavender undertones. The dark studio backdrop creates dramatic contrast, emphasizing the clean lines of the cut and the striking blue eyes and pink-toned makeup of the wearer. This is a bold, fashion-forward look that celebrates minimalism.

### Styling Details
- Uniform buzz cut, approximately 0.5 inches all around
- Platinum blonde color with cool lavender undertones
- No parting required — hair lies flat naturally
- Tapered slightly at the temples and neckline for a polished finish
- Minimal styling needed — light moisturizer to maintain scalp health
- Pairs beautifully with statement makeup and accessories

### Ideal For
Oval, heart, and diamond face shapes. A high-impact, ultra-low-maintenance hairstyle that draws attention to facial features. Perfect for anyone wanting to make a bold statement with minimal daily upkeep. The platinum color adds a high-fashion editorial edge.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1B',
      length: 'buzz',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'flat',
      partingPattern: 'none',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'platinum-blonde',
      hasColorTreatment: true,
      promptFamily: 'standard',
    },
  },

  // 2 — Bob (male) — Young man fixing black hair in studio setting
  {
    name: 'Tousled Black Curtain-Parted Medium Length',
    category: 'Bob',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/20381870/pexels-photo-20381870.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 65,
    ai_description: `### Title: Tousled Black Curtain-Parted Medium Length

### Overview
A youthful, casual medium-length hairstyle featuring jet-black hair that falls to chin level. The hair is styled with a relaxed center-curtain part, with strands falling loosely around the face creating a laid-back, effortlessly cool vibe. In this studio portrait, the subject runs his fingers through the hair, showcasing its natural body and soft texture. The natural black sheen catches the light beautifully.

### Styling Details
- Medium length hair, approximately 5-6 inches, reaching chin level
- Soft center part with curtain-style framing around the face
- Tousled, finger-combed texture for a lived-in finish
- Natural jet-black color with no chemical processing
- Light-hold styling cream applied for texture without stiffness
- No fade or undercut — hair falls uniformly at a single length

### Ideal For
Oval, oblong, and angular face shapes. A versatile, low-maintenance look suitable for casual and creative settings. The curtain part softens angular features while the medium length provides enough hair to style in multiple ways. Popular among K-pop and J-fashion trends.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 3 — Fashion (female) — Edgy dark pixie cut with jewelry and attitude
  {
    name: 'Edgy Textured Pixie Cut with Silver Accents',
    category: 'Fashion',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/9197236/pexels-photo-9197236.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 70,
    ai_description: `### Title: Edgy Textured Pixie Cut with Silver Accents

### Overview
A bold, fashion-forward pixie cut featuring short, dark hair with choppy textured layers. The hair is cropped close at the sides and back with slightly longer, piece-y layers on top that can be swept forward or to the side. The look is accessorized with statement silver jewelry including chunky rings and chains, creating an urban-chic aesthetic. The dark background and moody lighting emphasize the sharp angles of the cut.

### Styling Details
- Short pixie cut with longest layers approximately 2 inches on top
- Tapered sides and back, blended smoothly
- Choppy, textured layers created with point-cutting technique
- Styled with texturizing paste for piece-y separation and hold
- Natural dark brown/black color, no chemical treatment
- Forward-swept fringe that grazes the forehead

### Ideal For
Heart, oval, and square face shapes. An expressive, high-fashion cut that highlights cheekbones and jawline. Perfect for creative professionals and anyone seeking a bold, statement hairstyle that requires minimal daily styling but maximum impact.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C',
      length: 'short',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 4 — Protective (female) — Sophisticated vintage updo with white dress
  {
    name: 'Classic Hollywood Rolled Updo with Vintage Glamour',
    category: 'Protective',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/5371914/pexels-photo-5371914.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 74,
    ai_description: `### Title: Classic Hollywood Rolled Updo with Vintage Glamour

### Overview
A breathtaking vintage-inspired updo that channels 1940s Hollywood glamour. The blonde hair is swept into an elaborate rolled arrangement at the crown, with sculpted victory rolls framing the face. The look is paired with an elegant white dress and classic red lipstick, creating a complete Old Hollywood tableau. Every strand is meticulously placed, showcasing expert pin-curling and roll-setting technique.

### Styling Details
- Sculpted victory rolls at the front, framing the face symmetrically
- Hair gathered and rolled into a polished updo at the crown
- Pin curls set with setting lotion for lasting hold and definition
- Blonde hair with warm honey tones, likely a salon color treatment
- High-gloss finish achieved with shine spray
- Secured with bobby pins concealed within the rolls
- Clean neckline exposure for pairing with statement necklaces

### Ideal For
All face shapes, especially round and square — the height from the rolls creates elongation. A statement hairstyle for themed events, vintage weddings, and editorial shoots. Requires advanced styling skill and patience but creates an unforgettable, camera-ready look.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'high',
      partingPattern: 'side-right',
      complexity: 'highly-intricate',
      requiresEdgeWork: false,
      baseColor: 'honey-blonde',
      hasColorTreatment: true,
      promptFamily: 'protective-install',
    },
  },

  // 5 — Fashion (male) — Man in black leather jacket, urban setting with styled hair
  {
    name: 'Slick Urban Quiff with Leather Edge',
    category: 'Fashion',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/3713593/pexels-photo-3713593.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 68,
    ai_description: `### Title: Slick Urban Quiff with Leather Edge

### Overview
A stylish urban quiff hairstyle worn with confidence in a streetwear setting. The dark hair is swept upward and back from the forehead into a voluminous quiff, with the sides kept shorter for contrast. The subject wears a black leather jacket, creating a rock-and-roll aesthetic that perfectly complements the bold, elevated hairstyle. The natural lighting highlights the hair's texture and the precision of the styling.

### Styling Details
- Voluminous quiff rising approximately 2-3 inches from the forehead
- Sides cut shorter, blended with scissors (no hard fade line)
- Hair swept back and upward using blow-dryer and round brush
- Finished with medium-hold matte pomade for texture and control
- Natural dark brown color with no chemical treatment
- Back hair tapered neatly into the neckline

### Ideal For
Oval, round, and heart face shapes. The quiff adds height and elongates the face. A versatile fashion-forward hairstyle that works for both casual streetwear and smart-casual occasions. Popular among urban creatives and those seeking a statement look with manageable upkeep.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'medium',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'blow-out',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 6 — Fades (male) — Young man close-up with modern hairstyle, white background
  {
    name: 'Clean Textured Crop with Temple Fade',
    category: 'Fades',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/16106146/pexels-photo-16106146.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 71,
    ai_description: `### Title: Clean Textured Crop with Temple Fade

### Overview
A modern, clean-cut textured crop hairstyle photographed in an intimate close-up against a white background. The dark hair is kept short on top with textured layers that create natural movement and dimension. The sides feature a precise temple fade that blends seamlessly into the longer top section. This is a polished, contemporary barbershop look that balances precision with youthful energy.

### Styling Details
- Textured crop on top, approximately 2-3 inches in length
- Temple fade on the sides, graduating from skin to the top length
- Choppy, point-cut texture on top for natural movement
- Styled forward with a light matte clay for separation
- Natural dark brown color, clean and uniform
- Clean neckline taper at the back

### Ideal For
All face shapes — the textured crop is universally flattering. A versatile, easy-to-maintain hairstyle that looks sharp both dressed up and casual. Popular among young professionals and students who want a modern look that requires minimal morning styling.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'short',
      fadeType: 'temp-fade',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'dark-brown',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 7 — Straight (male) — Bearded male with long flowing dark hair, dark studio
  {
    name: 'Flowing Long Dark Mane with Full Beard',
    category: 'Straight',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/6274754/pexels-photo-6274754.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 66,
    ai_description: `### Title: Flowing Long Dark Mane with Full Beard

### Overview
A dramatic, masculine long-hair look featuring dark, flowing locks that extend past the shoulders. The hair falls naturally with a slight wave, framing a well-maintained full beard. Shot in dark, moody studio lighting wearing a black crew-neck t-shirt, the overall aesthetic is intense and artistic. The hair has a natural, healthy sheen that catches dramatic side lighting beautifully.

### Styling Details
- Long hair extending 10-12 inches past the shoulders
- Natural slight wave, no heat styling applied
- Center-parted with hair falling evenly on both sides
- No layering — single-length cut for maximum weight and flow
- Conditioned for a healthy, natural sheen
- Paired with a full, well-groomed beard trimmed to medium length
- Air-dried or minimally blow-dried for a natural finish

### Ideal For
Oval, rectangular, and angular face shapes. A bold, expressive hairstyle for men who embrace longer hair as a statement of individuality. Requires regular conditioning and trimming but the daily styling is minimal. Ideal for creative professionals, musicians, and those who appreciate a rugged, artistic aesthetic.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2A',
      length: 'extra-long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'center',
      complexity: 'simple',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 8 — Traditional (female) — Sophisticated woman with pearls and elegant updo
  {
    name: 'Pearl-Accented Blonde Updo with Side Sweep',
    category: 'Traditional',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/16995841/pexels-photo-16995841.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 75,
    ai_description: `### Title: Pearl-Accented Blonde Updo with Side Sweep

### Overview
An exquisitely elegant updo featuring warm blonde hair swept into a sophisticated arrangement at the crown. The front section is parted to the side with a soft, voluminous sweep that frames the face gracefully. Pearl strand accessories are woven through the updo, adding a luxurious bridal quality. The subject poses with one hand touching her face, highlighting the refined elegance of both the hairstyle and the overall presentation.

### Styling Details
- Hair gathered and twisted into a polished updo at the crown
- Side-swept front section with soft volume at the root
- Pearl strand accessories interlaced through the updo
- Warm blonde color with honey and golden undertones
- Set with velcro rollers for root lift before pinning up
- Finished with medium-hold hairspray for all-day hold
- Soft wisps left at the temples for a romantic, approachable feel

### Ideal For
All face shapes, especially round and square — the side sweep and height create flattering angles. A classic bridal or formal event hairstyle that communicates sophistication and grace. The pearl accents make it particularly suited for weddings, galas, and upscale celebrations.`,
    attributes: {
      hairType: 'wavy',
      hairTexture: '2A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'sculpted',
      volumeProfile: 'high',
      partingPattern: 'side-left',
      complexity: 'highly-intricate',
      requiresEdgeWork: false,
      baseColor: 'honey-blonde',
      hasColorTreatment: true,
      promptFamily: 'protective-install',
    },
  },

  // 9 — Straight (female) — Smiling woman with vibrant red bob in red turtleneck
  {
    name: 'Vibrant Copper Red Bob with Natural Volume',
    category: 'Straight',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/7274470/pexels-photo-7274470.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 69,
    ai_description: `### Title: Vibrant Copper Red Bob with Natural Volume

### Overview
A stunning, vibrant copper-red bob hairstyle that perfectly complements a matching red turtleneck sweater and bold red background. The hair falls to just past the chin in a soft, rounded bob shape with natural volume and subtle movement. The warm copper-red color is rich and multidimensional, catching the light to reveal golden and auburn highlights. The subject's warm smile brings life and approachability to this color-coordinated editorial look.

### Styling Details
- Chin-length bob with soft, rounded layers for natural body
- Vibrant copper-red color achieved through professional salon coloring
- Subtle layering throughout for movement and volume
- Blow-dried with a round brush for smooth, bouncy finish
- Slight side part for asymmetric framing
- No bangs — clean forehead exposure for an open, fresh look
- Finished with a light serum for shine and frizz control

### Ideal For
Oval, heart, and oblong face shapes. The chin-length bob is universally flattering and the warm copper-red color suits warm and neutral skin tones beautifully. A bold, confident hairstyle that makes a statement while remaining professional and polished. Requires regular color maintenance every 4-6 weeks.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '1C',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'blow-out',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'copper-red',
      hasColorTreatment: true,
      promptFamily: 'standard',
    },
  },

  // 10 — Modern (male) — Stylish male model with turtleneck, modern swept hairstyle
  {
    name: 'Modern Side-Swept Gentleman with Clean Taper',
    category: 'Modern',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/20772384/pexels-photo-20772384.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 70,
    ai_description: `### Title: Modern Side-Swept Gentleman with Clean Taper

### Overview
A refined, contemporary side-swept hairstyle worn by a well-groomed man in a dark turtleneck against a blurred urban backdrop. The dark hair is swept to one side with controlled volume on top, while the sides are neatly tapered for a clean, modern silhouette. The overall look is polished and editorial, communicating sophistication and attention to detail. The natural lighting captures the hair's healthy texture and the precision of the barbering.

### Styling Details
- Side-swept top section, approximately 3-4 inches in length
- Neatly tapered sides blended with scissors for a soft transition
- Styled with a medium-hold cream for flexible control
- Natural dark brown color, clean and well-maintained
- Defined side part created with a comb during blow-drying
- Back tapered cleanly into the neckline
- Light matte finish for a natural, non-greasy appearance

### Ideal For
All face shapes, particularly round and square — the side sweep and volume add asymmetry and elongation. A versatile gentleman's hairstyle that transitions seamlessly from the office to evening events. Low maintenance once the cut is established, requiring only a quick blow-dry and product application.`,
    attributes: {
      hairType: 'straight',
      hairTexture: '2A',
      length: 'medium',
      fadeType: 'taper',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'blow-out',
      volumeProfile: 'medium',
      partingPattern: 'side-left',
      complexity: 'moderate',
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
  console.error('Fatal:', err);
  process.exit(1);
});
