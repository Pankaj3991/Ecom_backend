// middleware/uploadMiddleware.js
const multer = require("multer");
const { cloudinary } = require("../config/cloudinaryConfig");
const streamifier = require("streamifier");

// Memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to upload a single file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Helper to upload multiple files
const uploadMultipleToCloudinary = async (files, folder) => {
  const results = [];
  for (let file of files) {
    const res = await uploadToCloudinary(file.buffer, folder);
    results.push(res.secure_url);
  }
  return results;
};

module.exports = { upload, uploadToCloudinary, uploadMultipleToCloudinary };