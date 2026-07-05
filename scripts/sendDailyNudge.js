// scripts/sendDailyNudge.js
// Sends the daily PERSONALIZED recommendation nudge to all eligible users:
// each user gets a hairstyle recommended from their own taste, deep-linked to it,
// falling back to a generic nudge when no recommendation is available.
// Run once a day by system cron. Per-user rate limits prevent duplicates.
//
//   node scripts/sendDailyNudge.js
//   node scripts/sendDailyNudge.js --dry   (generate + log sample messages, send nothing)

require('dotenv').config();
const mongoose = require('mongoose');
const { runDailyRecommendationCampaign } = require('../services/campaignService');
const { generateRecommendationTemplates, fillStyle, personalize } = require('../services/aiNudgeService');

const DRY_RUN = process.argv.includes('--dry');

(async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  if (DRY_RUN) {
    console.log('🧪 DRY RUN — sample personalized recommendation messages (not sending):');
    const templates = await generateRecommendationTemplates(10);
    const sampleStyles = ['Box Braids', 'Textured Crop Fade', 'Soft Locs', 'Slicked-Back Undercut'];
    templates.forEach((t, i) => {
      const style = sampleStyles[i % sampleStyles.length];
      const p = personalize(fillStyle(t, { style }), 'Ada');
      console.log(`  ${String(i + 1).padStart(2)}. [${p.title}]  ${p.body}`);
    });
  } else {
    const result = await runDailyRecommendationCampaign();
    console.log('Daily recommendation result:', JSON.stringify(result, null, 2));
  }

  await mongoose.disconnect();
  console.log('Done');
})().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
