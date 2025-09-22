const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/userContoller.js");

const {
  isAuthenticatedUser,
  authorizeRoles,
  isLoggedIn,
} = require("../middleware/auth");
const {
  upload,
  uploadToCloudinary,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// Register user with avatar
router.route("/register").post(
  isLoggedIn,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      if (req.file) {
        const result = await uploadToCloudinary(
          req.file.buffer,
          "BansalElectronicsShop"
        );
        req.body.avatar = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }
      next();
    } catch (err) {
      next(err);
    }
  },
  registerUser
);

// Login
router.route("/login").post(isLoggedIn, loginUser);

// Logout
router.route("/logout").get(isAuthenticatedUser, logout);

// User details
router.route("/me").get(isAuthenticatedUser, getUserDetails);

// Update password
router.route("/password/update").put(isAuthenticatedUser, updatePassword);

// Update profile with avatar
router.route("/me/update").put(
  isAuthenticatedUser,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, "BansalElectronicsShop");
        req.body.avatar = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }
      next(); // call updateProfile controller
    } catch (err) {
      next(err);
    }
  },
  updateProfile
);

// Get all users -- admin
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

// Get single user, update role, delete user -- admin
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

module.exports = router;
