/**
 * Batch 13 Seed Script — 10 new hairstyles (Male-Gap Focus + Global Diversity)
 * DB before: 329 total | Target after: 339
 *
 * Focuses on under-represented male categories:
 *   Twists/male 7→8, Afros/male 6→7, Braids/male 7→8,
 *   Locs/male 7→8, Protective/male 8→9, Weaves/male 7→8,
 *   Fashion/male 11→12, Weaves/female 9→10, Afros/female 9→10, Twists/female 9→10
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
  // 1 — Twists/male — Man with beard and defined twists, neutral background
  {
    name: 'Defined Twists with Groomed Beard Portrait',
    category: 'Twists',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/20514563/pexels-photo-20514563.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 54,
    ai_description: `### Title: Defined Twists with Groomed Beard Portrait

### Overview
A striking close-up portrait of an African man featuring well-defined two-strand twists paired with a neatly groomed full beard. Shot against a soft neutral background, the image highlights the precision of each twist — uniform in thickness and spaced evenly across the scalp. The combination of the textured twists and maintained facial hair creates a polished, intentional look that balances natural hair expression with modern masculinity.

### Styling Details
- Medium-length two-strand twists (approximately 4-6 inches)
- Uniform pencil-width twist thickness throughout
- Twists hang naturally with slight forward and lateral draping
- Dark natural black color with healthy sheen
- Neat root sections with clean parting grid visible at the scalp
- Well-groomed full beard trimmed to complement the twist style
- No fade or undercut — full coverage twisting from hairline to crown
- Moisturized appearance indicating proper product use (twist butter or cream)

### Ideal For
All face shapes, particularly oval and oblong. A versatile protective style for men that maintains natural texture while providing definition and structure. Easy maintenance — retwist every 2-3 weeks with moisturizing between washes. Works for professional settings, creative environments, and casual wear.`,
    attributes: {
      hairType: 'twisted',
      hairTexture: '4A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 2 — Afros/male — Man with afro-centric hairstyle in gray hoodie, studio shot
  {
    name: 'Studio Afro Natural in Gray Hoodie',
    category: 'Afros',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/11013302/pexels-photo-11013302.png?cs=srgb&w=1200',
    price: 0,
    popularity: 52,
    ai_description: `### Title: Studio Afro Natural in Gray Hoodie

### Overview
A clean studio close-up of an adult African man wearing a casual gray hoodie, showcasing a beautifully maintained medium-length afro with defined 4A/4B coil texture. The hair is picked out to a rounded, symmetrical shape that frames the face naturally. Shot with professional studio lighting against a clean background, the portrait has an editorial quality that highlights the density and texture of the natural afro while maintaining an approachable, everyday vibe through the casual hoodie styling.

### Styling Details
- Medium-length afro approximately 3-4 inches from scalp
- Dense 4A/4B coil pattern with consistent texture throughout
- Rounded shape — slightly wider at sides than top
- Natural sheen from leave-in conditioner or light oil
- Full coverage with no visible thinning or patching
- Well-maintained beard complementing the afro shape
- No parting — hair grows outward uniformly from all angles
- No heat damage — fully natural coil texture preserved

### Ideal For
Oval, diamond, and heart face shapes. A classic men's natural style that requires minimal daily styling — just moisturize and pick out. The rounded shape softens angular features and balances longer face shapes. Perfect for men who want to grow out their natural hair without committing to locs or twists.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4B',
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

  // 3 — Braids/male — Man with braided hair, green jacket, brick wall
  {
    name: 'Urban Braids with Green Jacket by Brick Wall',
    category: 'Braids',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/5592261/pexels-photo-5592261.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 56,
    ai_description: `### Title: Urban Braids with Green Jacket by Brick Wall

### Overview
A stylish indoor portrait of a young man with neatly braided hair wearing a fashionable green jacket, posed against an exposed brick wall. The braids are medium-length individual box braids that hang freely from the crown, creating a relaxed yet polished look. The urban industrial backdrop — raw brick texture and warm ambient light — complements the street-fashion aesthetic perfectly. The combination of structured braids with a trendy jacket creates a modern, confident statement.

### Styling Details
- Medium-length individual box braids (approximately 6-8 inches hanging)
- Braids hang freely from a center-to-off-center parting
- Consistent braid thickness — approximately pinky-finger width
- Natural black color with no extensions or color treatment
- Clean scalp visible at parting lines
- Braids reach approximately jaw to chin length
- Some braids tucked behind ears for face-framing effect
- Neat, fresh installation with no frizz at roots

### Ideal For
All face shapes. Box braids on men offer versatile styling — wear them down, pulled back, or half-up. This medium length is ideal for first-time braid wearers who want style without excessive weight. Lasts 4-6 weeks with proper nighttime wrapping and edge moisturizing.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 4 — Locs/male — Fashionable man with locs in black coat at night
  {
    name: 'Night Elegance Locs with Black Coat Polish',
    category: 'Locs',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/18961505/pexels-photo-18961505.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 58,
    ai_description: `### Title: Night Elegance Locs with Black Coat Polish

### Overview
A moody, atmospheric portrait of a fashionable young man with mature locs, captured at night while leaning on a metal railing. Wearing a tailored black coat, the subject projects sophistication and urban elegance. The locs are medium-to-long length, well-maintained, and draped naturally around the shoulders. Night-time ambient lighting creates dramatic shadows that highlight the cylindrical shape of each individual loc and their healthy, polished surface.

### Styling Details
- Mature medium-to-long locs (12+ inches) hanging past the shoulders
- Well-maintained cylindrical shape — regular palm-rolling evident
- Locs hang freely and naturally on all sides
- Natural dark black color with slight sheen from loc oil
- Medium thickness — approximately index-finger width per loc
- Clean root sections showing healthy new growth incorporation
- No accessories or wrapping — simple, elegant free-hanging style
- No frizz or unraveling — indicating mature, well-cared-for locs

### Ideal For
All face shapes. Long hanging locs add visual length to rounder faces and frame angular features softly. A masculine, refined take on locs that transitions seamlessly from casual to formal (as demonstrated by the coat styling). Ideal for men with mature locs (1+ year) seeking a low-maintenance yet elegant daily style.`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'locs',
    },
  },

  // 5 — Protective/male — Man with braided protective style, thoughtful expression
  {
    name: 'Thoughtful Braided Protective Close-Up',
    category: 'Protective',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/6626742/pexels-photo-6626742.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 50,
    ai_description: `### Title: Thoughtful Braided Protective Close-Up

### Overview
An intimate close-up portrait of a young man with neatly braided protective styling, captured looking away from the camera with a thoughtful, contemplative expression. The braids are medium-length cornrows that flow from the front hairline toward the back of the head in parallel rows. The soft studio lighting creates gentle highlights along each braid, emphasizing the geometric precision of the pattern. The subject's clean skin, defined jawline, and the minimal composition create a powerful, artistic portrait.

### Styling Details
- Cornrow braids running from front hairline toward the nape
- Tight, consistent braiding with even tension throughout
- Parallel row pattern with clean scalp partings visible between rows
- Approximately 6-8 parallel rows across the head
- Natural hair braided close to scalp without extensions
- Fresh installation — no frizz or loose hairs at edges
- Clean temple area and natural hairline
- Medium spacing between rows showing scalp health

### Ideal For
All face shapes. Cornrow protective styling keeps hair neat for 2-4 weeks while protecting ends from breakage. The close-to-scalp styling is ideal for active men — stays secure during workouts, sports, and daily activities. Works in professional settings while making a confident style statement.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'flat',
      partingPattern: 'geometric',
      complexity: 'moderate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
    },
  },

  // 6 — Weaves/female — Fashionable woman with vibrant braided hair outdoors
  {
    name: 'Vibrant Pink Braided Install on Casual Day',
    category: 'Weaves',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/10816994/pexels-photo-10816994.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 57,
    ai_description: `### Title: Vibrant Pink Braided Install on Casual Day

### Overview
A fashionable outdoor portrait of a young woman with striking vibrant pink/magenta braided hair extensions, posing casually on a sunny day. The braids are long, individually installed box braids in a bold pink-purple color that makes a dramatic fashion statement. The hair cascades past the shoulders with natural draping and movement. The outdoor natural lighting highlights the vivid color saturation and the neat, uniform braiding pattern. The casual styling — touching her hair with a confident pose — creates an approachable, trendy aesthetic.

### Styling Details
- Long individual box braids with synthetic hair extensions
- Vibrant pink/magenta color throughout — full fantasy color
- Braids extend well past shoulders, approximately chest-length
- Uniform braid thickness — approximately pencil-width
- Hair parted naturally with braids falling on both sides
- Some braids pulled to one side for asymmetric styling
- Neat, fresh installation with clean root sections
- No natural hair showing — full coverage extension braids

### Ideal For
All face shapes. Long colored box braids are a bold protective style that makes a vibrant fashion statement while keeping natural hair safely tucked away. Lasts 6-8 weeks. The color adds personality without committing to permanent dye on natural hair. Perfect for creative professionals, students, and fashion-forward individuals.`,
    attributes: {
      hairType: 'braided',
      hairTexture: '4A',
      length: 'extra-long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'free-form',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'pink',
      hasColorTreatment: true,
      promptFamily: 'protective-install',
    },
  },

  // 7 — Afros/female — Beautiful woman with styled hair looking up, studio/black bg
  {
    name: 'Sculpted Natural Updo with Dark Studio Glamour',
    category: 'Afros',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/2331539/pexels-photo-2331539.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 60,
    ai_description: `### Title: Sculpted Natural Updo with Dark Studio Glamour

### Overview
A breathtaking editorial portrait of a beautiful young black woman with a sculpted natural hair updo, photographed in a professional studio against a dramatic black background. The hair is styled upward into an artistic, voluminous shape that adds height and drama to the overall silhouette. Studio lighting captures the dimension and texture of the natural curls while creating striking highlights along the hair's surface. The subject gazes thoughtfully upward, creating a powerful, aspirational composition.

### Styling Details
- Natural 4A/4B hair styled into a sculptural updo
- Hair lifted and arranged upward from the crown for maximum height
- Visible curl/coil texture maintained throughout the styling
- Slight forward-leaning arrangement for artistic silhouette
- Hair sections smoothly transitioned from scalp to updo body
- Natural black color with healthy shine from styling products
- Edges laid smoothly — possible gel application for polished finish
- Professional styling evident — likely editorial/photoshoot preparation

### Ideal For
Oval, round, and heart face shapes. The upward volume creates vertical lines that elongate the face and highlight cheekbones and jawline. A show-stopping style for special events, photoshoots, and occasions where you want maximum visual impact. While this specific sculpted shape requires professional styling, simpler updo variations can be achieved at home with pins and setting gel.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'none',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'natural-textured',
    },
  },

  // 8 — Fashion/male — Man with unique hairstyle, leather jacket, red/white bg
  {
    name: 'Leather Jacket Natural with Bold Red Backdrop',
    category: 'Fashion',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/33553635/pexels-photo-33553635.jpeg?cs=srgb&w=1200',
    price: 1,
    popularity: 53,
    ai_description: `### Title: Leather Jacket Natural with Bold Red Backdrop

### Overview
A striking studio portrait of a young man with a unique, fashion-forward natural hairstyle, wearing a leather jacket and posed against a bold red and white background. The hair is styled into a creative shape — likely an asymmetric or sculpted natural texture that breaks from conventional men's hairstyling norms. The combination of the edgy leather jacket, vibrant backdrop, and unconventional hair creates a high-fashion editorial aesthetic that pushes boundaries while remaining stylish and wearable.

### Styling Details
- Short-to-medium natural hair styled into a creative, fashion-forward shape
- Asymmetric or sculpted arrangement for editorial impact
- Natural texture maintained — likely 3C/4A curl pattern
- Defined with styling product for hold and shape
- Clean edges and temples — possibly with soft lineup
- Dark natural color — no bleaching or coloring
- Volume concentrated in specific areas for artistic effect
- Hair works as an extension of the overall fashion statement

### Ideal For
All face shapes, particularly angular and oval. A high-fashion statement style ideal for creative individuals, models, musicians, and anyone who wants their hair to be a conversation piece. This style bridges the gap between barbershop precision and artistic expression. Best maintained with regular barber visits and daily product application.`,
    attributes: {
      hairType: 'coily',
      hairTexture: '4A',
      length: 'short',
      fadeType: 'none',
      hasLineup: true,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'none',
      complexity: 'moderate',
      requiresEdgeWork: true,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'standard',
    },
  },

  // 9 — Weaves/male — Man with blonde dreadlock extensions, artistic portrait
  {
    name: 'Artistic Blonde Loc Extensions with Feather Attire',
    category: 'Weaves',
    gender: 'male',
    sourceUrl: 'https://images.pexels.com/photos/15332908/pexels-photo-15332908.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 49,
    ai_description: `### Title: Artistic Blonde Loc Extensions with Feather Attire

### Overview
A bold, artistic portrait of a male model wearing long blonde dreadlock extensions paired with dramatic black feather attire against a warm brown background. The locs are dyed or synthetic extensions in a striking platinum blonde/golden color that contrasts dramatically with the model's dark skin tone. The styling is avant-garde and editorial — the combination of the unconventional blonde loc color, theatrical black feather costume, and moody studio lighting creates a high-fashion, boundary-pushing aesthetic that challenges traditional masculine hairstyle norms.

### Styling Details
- Long blonde/golden dreadlock extensions reaching past shoulders
- Dyed or synthetic blonde color — full coverage, no dark roots visible
- Locs hang freely with natural draping and movement
- Medium-to-thick individual loc width
- Volume concentrated at mid-lengths with natural tapering at ends
- Styled loose and free-hanging for maximum dramatic effect
- Bold color choice making a strong fashion statement
- Extensions installed over or integrated with natural hair

### Ideal For
All face shapes. This is a high-fashion, editorial statement look best suited for creative professionals, performers, models, and individuals who use hair as artistic expression. The blonde color creates maximum contrast on darker skin tones. While dramatic, the base technique (loc extensions) is protective and lasts 8-12 weeks.`,
    attributes: {
      hairType: 'locked',
      hairTexture: '4A',
      length: 'long',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'high',
      partingPattern: 'free-form',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'blonde',
      hasColorTreatment: true,
      promptFamily: 'locs',
    },
  },

  // 10 — Twists/female — Woman with intricate braided/twisted hairstyles, confident expression
  {
    name: 'Intricate Twisted Crown with Confident Expression',
    category: 'Twists',
    gender: 'female',
    sourceUrl: 'https://images.pexels.com/photos/32772989/pexels-photo-32772989.jpeg?cs=srgb&w=1200',
    price: 2,
    popularity: 55,
    ai_description: `### Title: Intricate Twisted Crown with Confident Expression

### Overview
A powerful close-up portrait of a woman showcasing intricate twisted hairstyles arranged in a sculptural pattern across the head. The twists are precisely formed and styled into a crown-like arrangement that frames the face with geometric beauty. Shot with dramatic lighting, the portrait captures both the technical mastery of the twisting technique and the subject's radiating confidence. Each twist is uniform in size and tension, creating a mesmerizing pattern that demonstrates the artistry of African hair braiding traditions.

### Styling Details
- Intricate two-strand or Senegalese twist arrangement
- Twists styled into a crown/updo formation around the head
- Uniform twist size — slim, approximately pinky-finger width
- Precise geometric parting pattern visible at scalp
- Twists wrapped and pinned into sculptural crown shape
- Natural dark black color with healthy luster
- Clean edges with smoothly laid baby hairs
- Professional installation evident — salon-quality precision

### Ideal For
All face shapes. The crown arrangement draws the eye upward and frames the face beautifully. A statement protective style that combines traditional African twist techniques with modern sculptural styling. Ideal for special events, professional settings, and anyone wanting an elevated natural hairstyle. Lasts 3-4 weeks with proper nighttime maintenance.`,
    attributes: {
      hairType: 'twisted',
      hairTexture: '4B',
      length: 'medium',
      fadeType: 'none',
      hasLineup: false,
      hasHardPart: false,
      stylingTechnique: 'natural',
      volumeProfile: 'medium',
      partingPattern: 'geometric',
      complexity: 'intricate',
      requiresEdgeWork: false,
      baseColor: 'natural-black',
      hasColorTreatment: false,
      promptFamily: 'braids-twists',
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
  process.exit(0);
}

seed().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
