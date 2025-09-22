const ErrorHandler = require("../services/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsync");
const Category = require("../models/categoryModel");
const sendToken = require("../services/jwtToken");
const { categoryValidation } = require("../validation/categoryValidation");
const { findByIdAndDelete } = require("../models/userModel");

// Add new category -- POST -- /admin/category
exports.addCategory = catchAsyncErrors(async (req, res, next) => {
  const { error } = categoryValidation.validate(req.body);
  if (error) {
    return next(new ErrorHandler(error.details[0].message, 400));
  }
  const category = await Category.create(req.body);
  res.status(201).json({
    success: true,
    message: `${req.body.name} category successfully added`,
  });
});
// Category list -- GET -- /admin/category
exports.listCategory = catchAsyncErrors(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    success: true,
    categories,
  });
});
// Category detail -- GET -- /admin/category/:id
exports.detailCategory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const detail = await Category.findById(id);
  if (!detail) {
    return next(new ErrorHandler("Category not found", 404));
  }
  res.status(200).json({
    success: true,
    detail,
  });
});
// Update category -- PUT -- /admin/category/:id
exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
  const { error } = categoryValidation.validate(req.body);
  if (error) {
    return next(new ErrorHandler(error.details[0].message, 400));
  }
  const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    message: "Successfully updated"
  });
});
// Delete category -- DELETE -- /admin/category/:id
exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }
  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Cateogry Deleted Successfully",
  });
});
