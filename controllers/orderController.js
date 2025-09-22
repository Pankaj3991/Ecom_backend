const User = require("../models/userModel.js");
const Product = require("../models/productModel.js");
const Order = require("../models/orderModel.js");
const ErrorHandler = require("../services/errorHandler");
const jwt = require("jsonwebtoken");
const catchAsyncErrors = require("../middleware/catchAsync");
const {
  updateStatusValidation,
  placeOrderValidation,
} = require("../validation/orderValidation.js");

// place an order -- user -- Decrease product quantity..
exports.placeOrder = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);

  // joi validation
  const { error } = placeOrderValidation.validate(req.body);
  if (error) {
    return next(new ErrorHandler(error.details[0].message, 400));
  }
  req.body.user = id;
  let totalAmount = 0;
  const product = await Product.findById(req.body.orderItem.product);
  if (product) {
    if (req.body.quantity > product.stock) {
      return next(
        new ErrorHandler(
          `Only ${product.quantity} of ${product.name} are available`
        )
      );
    }
    req.body.orderItem.name = product.name;
    req.body.orderItem.price = product.price;
    req.body.orderItem.images = product.images;
    totalAmount += req.body.orderItem.quantity * product.price;
    product.stock = Number(product.stock - req.body.orderItem.quantity);
    await product.save();
  } else {
    return next(new ErrorHandler("Product not found", 404));
  }

  req.body.totalAmount = totalAmount;
  const order = await Order.create(req.body);

  res.status(200).json({
    success: true,
    message: "Order added successfully",
    order,
  });
});

// cancel the order -- user, supplier(owner only), admin -- Increase product quantity back as that included in the order
exports.cancelOrder = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);

  const order = await Order.findById(req.params.orderId);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }
  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("Can't cancel now, Order has delivered", 403));
  }

  const product = await Product.findById(order.orderItem.product);
  const user = await User.findById(id);
  if (
    !user._id.equals(order.user) &&
    !user._id.equals(product.user) &&
    user.role !== "admin"
  ) {
    return next(
      new ErrorHandler(
        "Only order creator, supplier or admin can cancel the order",
        403
      )
    );
  }

  product.stock += order.orderItem.quantity;
  product.save();
  await Order.findByIdAndDelete(req.params.orderId);

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
  });
});

// update order status -- admin/supplier(owner only) -- [processing, shipped, delivered, cancelled]
exports.updateStatus = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);

  // joi validation
  const { error } = updateStatusValidation.validate(req.body);
  if (error) {
    return next(new ErrorHandler(error.details[0].message, 400));
  }

  const order = await Order.findById(req.params.orderId);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }
  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("Order has already been delivered", 403));
  }

  const product = await Product.findById(order.orderItem.product);
  const user = await User.findById(id);
  if (!user._id.equals(product.user) && user.role !== "admin") {
    return next(
      new ErrorHandler(
        "Only supplier(product owner) or admin can update the order",
        403
      )
    );
  }
  order.orderStatus = req.body.orderStatus;
  order.save();
  res.status(200).json({
    success: true,
    message: `Status successfully updated to ${req.body.orderStatus}`,
  });
});

exports.getOrders = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);
  const user = await User.findById(id);
  const orders = await Order.find({ user: id });
  res.status(200).json({
    success: true,
    totalOrders: orders.length,
    orders,
  });
});

exports.supplierOrders = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);
  const user = await User.findById(id);
  const orders = await Order.find().populate({
    path: "orderItem",
    populate: { path: "product", match: { user: id }, model: "Product" },
  });
  const filteredOrders = orders.filter(
    (order) => order.orderItem.product !== null
  );
  res.status(200).json({
    success: true,
    total: filteredOrders.length,
    filteredOrders,
  });
});
