require('dotenv').config();
const mongoose = require('mongoose');
const Hairstyle = require('../models/Hairstyle');

async function main() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const cats = await Hairstyle.aggregate([
    { $group: { _id: { category: '$category', gender: '$gender' }, count: { $sum: 1 } } },
    { $sort: { '_id.category': 1, '_id.gender': 1 } }
  ]);
  console.log('\n=== Category Distribution ===');
  cats.forEach(r => console.log(`${r._id.category} (${r._id.gender}): ${r.count}`));
  const total = await Hairstyle.countDocuments({});
  console.log(`\nTotal: ${total}`);
  await mongoose.disconnect();
}
main();
