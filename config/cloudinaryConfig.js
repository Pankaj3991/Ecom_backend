const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET_KEY
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'BansalElectronicsShop',
        allowedFormats: ["png", "jpg", "jpeg"],
        public_id: (req, file) => {
            // Generate a unique public_id using a timestamp or UUID
            const uniqueId = `${Date.now()}-${file.originalname.split('.')[0]}`;
            return uniqueId;
          }
    },
});

module.exports = {cloudinary,storage};
