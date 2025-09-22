const express = require("express");
const router = express.Router();
const {
  isAuthenticatedUser,
  authorizeRoles,
  isLoggedIn,
} = require("../middleware/auth");

const {
  createReview,
  getAllReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController.js");

router.route("/review").post(isAuthenticatedUser, createReview);

router.route("/review/:productId").get(getAllReview);

router
  .route("/review/:reviewId")
  .put(isAuthenticatedUser, updateReview)
  .delete(isAuthenticatedUser, deleteReview);

module.exports = router;
