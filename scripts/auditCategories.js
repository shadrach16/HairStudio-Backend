// scripts/auditCategories.js
// Finds hairstyles filed under a TEXTURED category whose name/description shows
// no textured signal — i.e. European styles polluting the buckets the app's
// positioning depends on ("Pearl-Accented Blonde Updo" filed as Traditional,
// "Classic Hollywood Rolled Updo" filed as Protective).
//
// Deliberately keyword-based, not AI: reproducible, free (Gemini billing is
// depleted), and every proposal shows the evidence that produced it.
//
//   node scripts/auditCategories.js          # dry run — prints proposals only
//   node scripts/auditCategories.js --apply  # writes the accepted proposals
//
// Only styles with a CONFIDENT replacement are proposed; anything ambiguous is
// listed separately for a human to judge rather than silently rewritten.

require('dotenv').config();
const mongoose = require('mongoose');
const Hairstyle = require('../models/Hairstyle');

const APPLY = process.argv.includes('--apply');

// Buckets whose integrity the diaspora positioning depends on.
const TEXTURED = [
  'Braids', 'Locs', 'Twists', 'Afros', 'Coils',
  'Protective', 'Weaves', 'Traditional', 'Low Cut', 'Fades'
];

// Evidence that a style genuinely belongs in a textured bucket.
const TEXTURED_SIGNAL = [
  'braid', 'cornrow', 'knotless', 'feed-in', 'feed in', 'stitch', 'fulani', 'lemonade',
  'loc', 'dread', 'sisterlock', 'twist', 'senegalese', 'marley', 'passion',
  'afro', 'coil', 'kinky', 'curl', 'coily', '4c', '4b', '3c', 'wash-and-go', 'wash and go',
  'fade', 'taper', 'waves', 'lineup', 'line-up', 'buzz', 'caesar', 'bald',
  'weave', 'sew-in', 'sew in', 'wig', 'closure', 'frontal', 'bundle', 'extension',
  'bantu', 'threading', 'protective', 'natural hair', 'texture', 'puff', 'twa'
];

// Signals of a styled/European look that does NOT belong in a textured bucket.
const NON_TEXTURED_SIGNAL = {
  Fashion: ['updo', 'chignon', 'rolled', 'roll', 'vintage', 'hollywood', 'glam',
            'pin-up', 'pinup', 'victory roll', 'bouffant', 'beehive', 'pearl',
            'rose', 'floral', 'bridal', 'tiara', 'gown'],
  Straight: ['silk press', 'bone straight', 'flat iron', 'sleek straight', 'blowout straight'],
  Bob: ['bob'],
};

// NAME ONLY — deliberately not the description. ai_description is AI-written
// prose that uses generic hair vocabulary ("twist", "curl", "texture") for
// every style, so a blonde updo reads as "textured" and slips through. Names
// are curated and specific, which makes them the only reliable signal here.
const text = (h) => `${h.name || ''}`.toLowerCase();

// Whole-word matching: substring matching flagged "Sleek Studio Pixie" because
// "roll" appears inside "controlled".
function matches(t, keyword) {
  return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(t);
}

function hasTexturedSignal(t) {
  return TEXTURED_SIGNAL.filter((k) => matches(t, k));
}

function proposeCategory(t) {
  for (const [cat, keys] of Object.entries(NON_TEXTURED_SIGNAL)) {
    const hit = keys.filter((k) => matches(t, k));
    if (hit.length) return { category: cat, evidence: hit };
  }
  return null;
}

(async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(uri);

  const styles = await Hairstyle.find({ category: { $in: TEXTURED } })
    .select('_id name category ai_description description')
    .lean();

  const confident = [];
  const ambiguous = [];

  for (const h of styles) {
    const t = text(h);
    const textured = hasTexturedSignal(t);
    if (textured.length > 0) continue; // genuinely textured — leave alone

    const proposal = proposeCategory(t);
    if (proposal && proposal.category !== h.category) {
      confident.push({ h, ...proposal });
    } else {
      ambiguous.push(h);
    }
  }

  console.log(`Scanned ${styles.length} styles in textured categories.`);
  console.log(`\n=== MISCATEGORISED, confident proposal (${confident.length}) ===`);
  for (const c of confident) {
    console.log(`  ${c.h.category.padEnd(12)} -> ${c.category.padEnd(9)} | ${c.h.name.slice(0, 52)}`);
    console.log(`      evidence: ${c.evidence.join(', ')}`);
  }

  console.log(`\n=== NO textured signal, but no confident target (${ambiguous.length}) — review by hand ===`);
  for (const h of ambiguous.slice(0, 40)) {
    console.log(`  ${h.category.padEnd(12)} | ${h.name.slice(0, 60)}`);
  }
  if (ambiguous.length > 40) console.log(`  … and ${ambiguous.length - 40} more`);

  if (APPLY) {
    let n = 0;
    for (const c of confident) {
      await Hairstyle.updateOne({ _id: c.h._id }, { $set: { category: c.category } });
      n++;
    }
    console.log(`\nAPPLIED ${n} category changes.`);
  } else {
    console.log('\nDRY RUN — nothing written. Re-run with --apply to commit the confident set.');
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
