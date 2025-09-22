const express = require('express');
const router = express.Router();

const {
    isAuthenticatedUser,
    authorizeRoles,
    isLoggedIn,
  } = require("../middleware/auth");

const {placeOrder, cancelOrder, updateStatus, getOrders, supplierOrders} = require("../controllers/orderController.js");

router.route("/order/placeOrder").post(isAuthenticatedUser, placeOrder);
router.route("/order/getOrders").get(isAuthenticatedUser, getOrders);
router.route("/order/supplierOrders").get(isAuthenticatedUser, authorizeRoles('supplier','admin'),supplierOrders);

router.route("/order/cancelOrder/:orderId").delete(isAuthenticatedUser, cancelOrder);
router.route("/order/updateStatus/:orderId").put(isAuthenticatedUser, authorizeRoles('supplier','admin'), updateStatus);

module.exports = router;