/**
 * One-time maintenance script: remove large base64/data-URI blobs from Generation.originalImage.url.
 *
 * Why: base64 images stored in MongoDB rapidly consume Atlas storage.
 * Safer default: only purge COMPLETED generations (UI uses generatedImage for completed cards).
 *
 * Usage:
 *   node scripts/purgeGenerationOriginalDataUris.js --dry-run
 *   node scripts/purgeGenerationOriginalDataUris.js
 *   node scripts/purgeGenerationOriginalDataUris.js --status=any --older-than-days=7
 */

const path = require('path');

// Load backend/.env even when script is executed from the repo root.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Generation = require('../models/Generation');

function getArgValue(name, defaultValue = undefined) {
  const prefix = `${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  if (!arg) return defaultValue;
  return arg.slice(prefix.length);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const status = getArgValue('--status', 'completed'); // completed | any
  const olderThanDaysRaw = getArgValue('--older-than-days', '0');
  const olderThanDays = Number(olderThanDaysRaw);

  if (!process.env.MONGO_URI) {
    throw new Error(
      'Missing MONGO_URI. Add it to backend/.env (or export it in your shell) before running this script.'
    );
  }

  if (!Number.isFinite(olderThanDays) || olderThanDays < 0) {
    throw new Error(`Invalid --older-than-days value: ${olderThanDaysRaw}`);
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const match = {
    'originalImage.url': { $regex: '^data:' },
  };

  if (status !== 'any') {
    match.status = status;
  }

  if (olderThanDays > 0) {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    match.createdAt = { $lt: cutoff };
  }

  const count = await Generation.countDocuments(match);

  console.log('Purge Generation.originalImage.url data URIs');
  console.log('Match:', JSON.stringify(match));
  console.log('Matched documents:', count);
  console.log('Mode:', dryRun ? 'DRY RUN (no changes)' : 'APPLY');

  if (dryRun || count === 0) {
    await mongoose.disconnect();
    return;
  }

  const result = await Generation.updateMany(match, {
    $set: {
      'originalImage.url': null,
      'originalImage.publicId': null,
    },
  });

  console.log('Update result:', {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    acknowledged: result.acknowledged,
  });

  await mongoose.disconnect();
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Purge failed:', err);
    process.exit(1);
  });
