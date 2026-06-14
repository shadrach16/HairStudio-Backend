// scripts/sendDailyNudge.js
// Sends the daily AI-generated re-engagement nudge to all eligible users.
// Intended to be run once a day by system cron. Per-user rate limits in
// campaignService prevent duplicates if it ever runs more than once.
//
//   node scripts/sendDailyNudge.js
//   node scripts/sendDailyNudge.js --dry   (generate + log messages, send nothing)

require('dotenv').config();
const mongoose = require('mongoose');
const { runDailyNudgeCampaign } = require('../services/campaignService');
const { generateNudges, personalize } = require('../services/aiNudgeService');

const DRY_RUN = process.argv.includes('--dry');

(async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  if (DRY_RUN) {
    console.log('🧪 DRY RUN — generating sample messages, not sending:');
    const pool = await generateNudges(15);
    pool.forEach((m, i) => {
      const p = personalize(m, 'Ada');
      console.log(`  ${String(i + 1).padStart(2)}. [${p.title}] ${p.body}`);
    });
  } else {
    const result = await runDailyNudgeCampaign();
    console.log('Daily nudge result:', JSON.stringify(result, null, 2));
  }

  await mongoose.disconnect();
  console.log('Done');
})().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
