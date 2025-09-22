const ErrorHandler = require("../services/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsync");
const Product = require("../models/productModel.js");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const Review = require("../models/reviewModel.js");

exports.createReview = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);
  req.body.user = id;

  let review = await Review.findOne({
    product: req.body.product,
    user: id,
  });

  if (review) {
    // Step 3: If the review exists, update it
    review.comment = req.body.comment;
    review.rating = req.body.rating;
    await review.save();

    return res
      .status(200)
      .json({ message: "Review updated successfully", review });
  } else {
    // Step 4: If no review exists, create a new one
    const newReview = await Review.create(req.body);

    // Step 5: Add the new review to the product's review array
    const product = await Product.findById(req.body.product);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    product.reviews.push(newReview._id);
    await product.save();
    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      review: newReview,
    });
  }
});

exports.getAllReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.productId).populate({
    path: "reviews", // Populate reviews in the product
    populate: {
      path: "user", // Populate user in each review
      model: "User", // Reference the User model for userId
    },
  });
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

exports.updateReview = catchAsyncErrors(async (req, res, next) => {});
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);

  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }
  if (review.user.toString() != id.toString()) {
    return next(new ErrorHandler("Only review owner is allowed to delete"));
  }
  await Product.findByIdAndUpdate(review.product.toString(), {
    $pull: { reviews: review._id },
  });
  await Review.findByIdAndDelete(req.params.reviewId);
  res.status(200).json({
    success: true,
    message: "Review successfully deleted",
  });
});
