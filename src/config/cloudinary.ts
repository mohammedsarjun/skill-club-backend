import { v2 as cloudinary } from 'cloudinary';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  // Avoid printing secrets; only log presence/absence to help debugging.
  console.warn('Cloudinary environment variables are not fully configured.', {
    cloud_name_defined: !!CLOUDINARY_CLOUD_NAME,
    api_key_defined: !!CLOUDINARY_API_KEY,
    api_secret_defined: !!CLOUDINARY_API_SECRET,
  });
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export { cloudinary };
