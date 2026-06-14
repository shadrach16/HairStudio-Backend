const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/hairstudio');
  const user = await User.findOneAndUpdate(
    { email: 'oluwamotunde@gmail.com' },
    { $inc: { credits: 50 } },
    { new: true }
  );
  if (user) {
    console.log('Updated:', user.email, '| Credits:', user.credits);
  } else {
    console.log('User not found');
  }
  await mongoose.disconnect();
}

main().catch(console.error);
