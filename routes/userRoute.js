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

const { isAuthenticatedUser, authorizeRoles,isLoggedIn } = require("../middleware/auth");
const multer = require("multer");
const { storage } = require("../config/cloudinaryConfig.js");
const upload = multer({ storage });

const router = express.Router();

router.route("/register").post(isLoggedIn, upload.single('avatar'),registerUser);

router.route("/login").post(isLoggedIn, loginUser);

router.route("/logout").get(isAuthenticatedUser, logout);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

// update profile 
router.route("/me/update").put(isAuthenticatedUser,upload.single('avatar'), updateProfile); 

// Get all users -- admin
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

// Get single user, update role of user, delete user -- admin 
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

module.exports = router;