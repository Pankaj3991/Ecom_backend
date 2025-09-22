const express = require("express");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middleware/auth");

const { upload } = require("../middleware/uploadMiddleware"); // only upload middleware
const { cloudinary } = require("../config/cloudinaryConfig"); // import cloudinary config

const {
  createProduct,
  updateProduct,
  deleteProduct,
  detailProduct,
  listProduct,
  supplierProducts,
} = require("../controllers/productController");

const router = express.Router();

// Upload folder name
const UPLOAD_FOLDER = "BansalElectronicsShop";

// Helper function to upload a single file buffer to Cloudinary
const uploadFileToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// ✅ CREATE product
router
  .route("/product")
  .get(listProduct)
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "supplier"),
    upload.array("images", 5),
    async (req, res, next) => {
      try {
        if (req.files && req.files.length > 0) {
          const uploadedImages = [];

          for (const file of req.files) {
            const result = await uploadFileToCloudinary(file.buffer, UPLOAD_FOLDER);
            uploadedImages.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          }

          req.body.images = uploadedImages;
        }

        next(); // call createProduct controller
      } catch (err) {
        next(err);
      }
    },
    createProduct
  );

// ✅ UPDATE product
router
  .route("/product/:id")
  .get(detailProduct)
  .put(
    isAuthenticatedUser,
    authorizeRoles("admin", "supplier"),
    upload.array("newImages", 5),
    async (req, res, next) => {
      try {
        if (req.files && req.files.length > 0) {
          const uploadedNewImages = [];

          for (const file of req.files) {
            const result = await uploadFileToCloudinary(file.buffer, UPLOAD_FOLDER);
            uploadedNewImages.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          }

          req.body.newImages = uploadedNewImages;
        }

        next();
      } catch (err) {
        next(err);
      }
    },
    updateProduct
  )
  .delete(isAuthenticatedUser, authorizeRoles("admin", "supplier"), deleteProduct);

// ✅ Supplier products
router
  .route("/supplier/product")
  .get(isAuthenticatedUser, authorizeRoles("supplier", "admin"), supplierProducts);

module.exports = router;
