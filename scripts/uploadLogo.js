require('dotenv').config();
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
cloudinary.uploader.upload(
  '/var/www/hairstudio/assets/temp/new_logo.png',
  { public_id: 'HairStudio/app_logo_premium', overwrite: true }
).then(r => {
  console.log('URL:', r.secure_url);
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
