const express = require("express");
const {
  addCategory,
  listCategory,
  detailCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const {
  isAuthenticatedUser,
  authorizeRoles,
  isLoggedIn,
} = require("../middleware/auth");

const router = express.Router();

router
  .route("/admin/category")
  .get(listCategory)
  .post(isAuthenticatedUser, authorizeRoles("admin"), addCategory);

router
  .route("/admin/category/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), detailCategory)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateCategory)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCategory);
  
module.exports = router;
