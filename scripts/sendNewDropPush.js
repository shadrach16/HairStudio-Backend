require('dotenv').config();
const mongoose = require('mongoose');
const { announceNewDrop } = require('../services/campaignService');

(async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const result = await announceNewDrop('10 Fresh New Styles');
  console.log('Push notification result:', JSON.stringify(result, null, 2));

  await mongoose.disconnect();
  console.log('Done');
})().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
