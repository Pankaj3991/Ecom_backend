const express = require("express");
const {
  isAuthenticatedUser,
  authorizeRoles,
  isLoggedIn,
} = require("../middleware/auth");
const multer = require("multer");
const { storage } = require("../config/cloudinaryConfig.js");
const upload = multer({ storage });

const {
  createProduct,
  updateProduct,
  deleteProduct,
  detailProduct,
  listProduct,
  supplierProducts,
} = require("../controllers/productController.js");
const router = express.Router();

router
  .route("/product")
  .get(listProduct)
  .post(isAuthenticatedUser, authorizeRoles("admin", "supplier"), upload.array('images', 5), createProduct);

router
.route("/product/:id")
.get(detailProduct)
.put(isAuthenticatedUser, authorizeRoles("admin", "supplier"),upload.array('newImages', 5),updateProduct)
.delete(isAuthenticatedUser, authorizeRoles("admin", "supplier"), deleteProduct);

router.route("/supplier/product").get(isAuthenticatedUser,authorizeRoles("supplier","admin"),supplierProducts);
module.exports = router;