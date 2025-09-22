const ErrorHandler = require("../services/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsync");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const Product = require("../models/productModel.js");
const Cart = require("../models/cartModel.js");
const mongoose = require("mongoose");

exports.addItem = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);

  req.body.user = id;
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);
  console.log(id);
  const exist = await Cart.findOneAndUpdate(
    {
      user: id,
      "cartItems.product": productId,
    },
    {
      $set: { "cartItems.$.quantity": quantity },
    },
    { new: true }
  );
  console.log("Executed");
  if (!exist) {
    await Cart.findOneAndUpdate(
      { user: id },
      {
        $push: {
          cartItems: {
            product: productId,
            quantity: quantity,
            price: product.price,
          },
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Item successfully added to cart",
    });
  }
  const cart = await Cart.find({ user: id });
  let total = 0;
  const totalAmount = cart[0].cartItems.forEach((item) => {
    total += item.price * item.quantity;
  });
  cart[0].totalPrice = total;
  cart[0].save();
  res.status(200).json({
    success: true,
    message: "Quantity successfully updated",
  });
});

exports.getAllItem = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);
  const cart = await Cart.find({ user: id }).populate({
    path: "cartItems", // Populate cartItems in the cart
    populate: {
      path: "product", // Populate product in each carItems
      model: "Product",
    },
  });
  if (!cart) {
    return next(new ErrorHandler("Can't found cart", 404));
  }
  res.status(200).json({
    success: true,
    cart,
  });
});

exports.removeItem = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);

  req.body.user = id;
  const updatedCart = await Cart.findOneAndUpdate(
    { user: id },
    {
      $pull: { cartItems: { product: req.params.productId } },
    },
    { new: true }
  );
  if (!updatedCart) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const cart = await Cart.find({ user: id });
  let total = 0;
  const totalAmount = cart[0].cartItems.forEach((item) => {
    total += item.price * item.quantity;
  });
  cart[0].totalPrice = total;
  cart[0].save();
  res.status(200).json({
    success: true,
    message: "Product successfully removed from cart",
  });
});
