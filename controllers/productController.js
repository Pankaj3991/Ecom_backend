const ErrorHandler = require("../services/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsync");
const { cloudinary } = require("../config/cloudinaryConfig.js");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");
const {
  createProductValidation,
  updateProductValidation,
} = require("../validation/productValidation.js");

// create product -- supplier, admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);
  req.body.user = id;

  // Validate images from middleware
  if (!req.body.images || req.body.images.length === 0) {
    return next(new ErrorHandler("Please upload at least 1 image", 400));
  }

  let category = await Category.find({ name: req.body.category });
  if (category.length === 0) {
    const categories = (await Category.find()).map((c) => c.name);
    return next(
      new ErrorHandler(
        `${req.body.category} does not exist, choose from ${categories}`,
        400
      )
    );
  }

  req.body.category = category[0]._id;

  const { error } = createProductValidation.validate(req.body);
  if (error) return next(new ErrorHandler(error.details[0].message, 400));

  const product = await Product.create(req.body);
  category[0].products.push(product._id);
  await category[0].save();

  res.status(201).json({
    success: true,
    message: "Product successfully created",
    product,
  });
});

// update product -- supplier, admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);
  // joi validation
  const { error } = updateProductValidation.validate(req.body);
  if (error) {
    return next(new ErrorHandler(error.details[0].message, 400));
  }
  const user = await User.findById(id);
  const product = await Product.findById(req.params.id).populate("category");
  if (user.role !== "admin" && product.user.toString() !== id.toString()) {
    return next(
      new ErrorHandler("Only owner or admin can update this product", 401)
    );
  }
  // ✅ Add new images (we sent them from router as req.body.newImages)
  if (req.body.newImages && req.body.newImages.length > 0) {
    req.body.newImages.forEach((img) => {
      product.images.push({
        public_id: img.public_id,
        url: img.url,
      });
    });
    await product.save();
  }
  // manage category --
  if (req.body.category) {
    // check if category exists
    let category = await Category.find({ name: req.body.category });
    if (category.length == 0) {
      category = await Category.find();
      const categories = category.map((ct) => ct.name);
      return next(
        new ErrorHandler(
          `${req.body.category} does not exist, please choose from -- ${categories}`
        )
      );
    }
    const oldCategoryId = product.category?._id;
    if (
      oldCategoryId &&
      oldCategoryId.toString() !== category[0]._id.toString()
    ) {
      await Category.findByIdAndUpdate(oldCategoryId, {
        $pull: { products: product._id },
      });
    }

    await Category.findByIdAndUpdate(
      category[0]._id,
      { $addToSet: { products: product._id } } // $push allows duplicates, but $addToSet don't allow duplicates
    );
    req.body.category = category[0]._id;
  }
  const { RemoveImages } = req.body;

  if (RemoveImages && RemoveImages.length > 0) {
    // Destroy on Cloudinary first
    for (const idToRemove of RemoveImages) {
      try {
        // Make sure you pass full public_id
        const result = await cloudinary.uploader.destroy(idToRemove);
        console.log(`Deleted from Cloudinary: ${idToRemove}`, result);
      } catch (err) {
        console.error(`Failed to delete from Cloudinary: ${idToRemove}`, err);
      }
    }

    // Now filter the DB array
    product.images = product.images.filter(
      (img) => !RemoveImages.includes(img.public_id)
    );

    await product.save();
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    message: "Product successfully updated",
    updatedProduct,
  });
});

// delete product -- supplier, admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);

  const user = await User.findById(id);
  const product = await Product.findById(req.params.id);

  if (user.role != "admin" && product.user.toString() != id.toString()) {
    return next(
      new ErrorHandler("Only owner or admin can update this product", 401)
    );
  }

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // deleting cloudinary images
  if (product.images) {
    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.uploader.destroy(
        product.images[index].public_id,
        (error, result) => {
          console.log(error, result);
        }
      );
    }
  }
  // deleting category's product.
  await Category.findByIdAndUpdate(product.category._id.toString(), {
    $pull: { products: product._id },
  });
  product.save();
  // Deleting product from database
  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "Product successfully deleted",
  });
});

// Get single product detail
exports.detailProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

// product listing -- all products, search, filter, pagination also.
exports.listProduct = catchAsyncErrors(async (req, res, next) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    supplier,
    page = 1,
    limit = 10,
  } = req.query;

  const { token } = req.cookies;
  let user;
  if (token) {
    const { id } = jwt.decode(token);

    user = await User.findById(id);
  }

  // Build a filter object
  let filter = {};

  // Search by product name or description
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } }, // Case-insensitive search in name
      { description: { $regex: search, $options: "i" } }, // Case-insensitive search in description
    ];
  }

  // Filter by category
  if (category) {
    filter.category = category;
  }

  if (supplier === "true") {
    filter.user = user._id;
  }
  // Filter by price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Pagination options
  const pageNumber = Number(page);
  const pageSize = Number(limit);
  const skip = (pageNumber - 1) * pageSize;

  // Get total number of products for pagination info
  const totalProducts = await Product.countDocuments(filter);

  // Get products with filtering, pagination, and sorting (optional)
  const products = await Product.find(filter)
    .populate("category")
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 }); // Sort by creation date (newest first)

  // Send response with products and pagination info
  res.status(200).json({
    success: true,
    products,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalProducts / pageSize),
    totalProducts,
  });
});

exports.supplierProducts = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);

  const user = await User.findById(id);
  const products = await Product.find({ user: user._id });
  res.status(200).json({
    success: true,
    products,
  });
});
