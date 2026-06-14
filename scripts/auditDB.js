require('dotenv').config();
const m = require('mongoose');
(async () => {
  await m.connect(process.env.MONGO_URI);
  const H = m.connection.db.collection('hairstyles');
  const cats = await H.aggregate([
    { $group: { _id: { cat: '$category', gen: '$gender' }, count: { $sum: 1 } } },
    { $sort: { '_id.cat': 1, '_id.gen': 1 } }
  ]).toArray();
  cats.forEach(c => console.log(c._id.cat + '/' + c._id.gen + ': ' + c.count));
  const total = await H.countDocuments();
  console.log('TOTAL:', total);
  
  // Also list all names to avoid duplicates
  const names = await H.find({}, { projection: { name: 1, _id: 0 } }).sort({ name: 1 }).toArray();
  console.log('\n--- ALL NAMES ---');
  names.forEach(n => console.log(n.name));
  
  await m.disconnect();
})();
