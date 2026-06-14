// boostNewStyles.js — Boost popularity of recent non-African hairstyles so they appear in trending/featured
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const col = db.collection('hairstyles');

  // Get the 30 most recently added styles (batches 11-13)
  const recent = await col.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(30)
    .project({ name: 1, category: 1, popularity: 1, createdAt: 1 })
    .toArray();

  console.log(`\nFound ${recent.length} recent styles:`);
  recent.forEach((s, i) => console.log(`  ${i + 1}. ${s.name} (${s.category}) - popularity: ${s.popularity}`));

  // Boost popularity of recent non-African styles to 80-95 range
  const nonAfricanCategories = ['Low Cut', 'Bob', 'Fades', 'Straight', 'Relaxed', 'Modern', 'Fashion', 'Weaves'];
  const toBoost = recent.filter(s => 
    nonAfricanCategories.includes(s.category) || 
    !['Afros', 'Locs', 'Twists', 'Braids', 'Coils', 'Traditional', 'Protective'].includes(s.category)
  );

  console.log(`\nBoosting ${toBoost.length} non-African styles:`);
  
  for (let i = 0; i < toBoost.length; i++) {
    const style = toBoost[i];
    // Assign high popularity: 85-98, top ones get highest
    const newPop = Math.min(98, 98 - (i * 1.5));
    
    await col.updateOne(
      { _id: style._id },
      { $set: { popularity: Math.round(newPop) } }
    );
    console.log(`  ✓ ${style.name}: ${style.popularity} → ${Math.round(newPop)}`);
  }

  console.log('\nDone! Boosted styles will now appear in trending/featured.');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
