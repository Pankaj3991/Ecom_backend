const express = require("express");
const {
  isAuthenticatedUser,
  authorizeRoles,
  isLoggedIn,
} = require("../middleware/auth");

const {
  addItem,
  getAllItem,
  removeItem,
} = require("../controllers/cartController.js");
const router = express.Router();

router.route("/cart").get(isAuthenticatedUser, getAllItem);

router.route("/cart/addItem").put(isAuthenticatedUser, addItem);

router
  .route("/cart/removeItem/:productId")
  .put(isAuthenticatedUser, removeItem);
module.exports = router;
