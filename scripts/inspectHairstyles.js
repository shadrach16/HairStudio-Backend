require('dotenv').config();
const mongoose = require('mongoose');
const Hairstyle = require('../models/Hairstyle');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const count = await Hairstyle.countDocuments();
  const cats = await Hairstyle.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const sample = await Hairstyle.find({}, { name: 1, category: 1, gender: 1, price: 1, popularity: 1, thumbnail: 1 }).limit(5).lean();
  
  console.log('Total hairstyles:', count);
  console.log('\nBy category:');
  cats.forEach(c => console.log(`  ${c._id}: ${c.count}`));
  console.log('\nSample entries:');
  sample.forEach(s => console.log(`  ${s.name} | ${s.category} | ${s.gender} | price:${s.price} | pop:${s.popularity}`));
  console.log('\nThumbnail pattern:', sample[0]?.thumbnail?.substring(0, 100));
  
  await mongoose.disconnect();
}

main().catch(console.error);
