const ErrorHandler = require("../services/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsync");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const sendToken = require("../services/jwtToken");
const { cloudinary } = require("../config/cloudinaryConfig.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  updatePwdValidation,
  updateRoleValidation,
} = require("../validation/userValidation.js");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password,avatar,role = "user" } = req.body;
  // const { error } = registerValidation.validate(req.body);
  // if (error) {
  //   return next(new ErrorHandler(error.details[0].message, 400));
  // }

  if (role == "admin") {
    return next(
      new ErrorHandler(
        "Can't add admin role, please select out from user & supplier",
        403
      )
    );
  }
  console.log(req.file.filename);

  const uniqueUser = await User.find({ email });
  if (uniqueUser.length > 0) {
    return next(
      new ErrorHandler("E-mail already registered, please login", 400)
    );
  }
  const user = await User.create({
    name,
    email,
    password,
    avatar,
    role,
  });
  // creating cart of the user..
  await Cart.create({ user: user._id });
  sendToken(user, 201, res);
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { error } = loginValidation.validate(req.body);
  if (error) {
    return next(new ErrorHandler(error.details[0].message, 400));
  }

  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  sendToken(user, 200, res);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "None",  // Required if frontend is on different origin
    secure: true,      // Required for HTTPS
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const currUser = jwt.decode(token);
  const user = await User.findById(currUser.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);
  const user = await User.findById(id).select("+password");

  const { error } = updatePwdValidation.validate(req.body);
  if (error) {
    return next(new ErrorHandler(error.details[0].message, 400));
  }

  const { oldPassword, newPassword } = req.body;

  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }
  user.password = newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { id } = jwt.decode(token);

  let user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const {avatar} = req.body;
  console.log(avatar);
  const { error } = updateProfileValidation.validate(req.body);
  if (error) {
    console.log(error);
    return next(new ErrorHandler(error.details[0].message, 400));
  }

  let imageUrl = user.avatar;
  if (req.file) {
    await cloudinary.uploader.destroy(
      user.avatar.public_id,
      (error, result) => {
        console.log(error, result);
      }
    );

    imageUrl = avatar;
  }
  req.body.avatar = imageUrl;
  user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Profile successfully updated",
    user,
  });
});

// Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const { error } = updateRoleValidation.validate(req.body);
  if (error) {
    return next(new ErrorHandler(error.details[0].message, 400));
  }
  await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Role successfully updated",
  });
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  // Also delete other information related to user like -- products created, reviews, cart, etc.
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  await cloudinary.uploader.destroy(user.avatar.public_id, (error, result) => {
    console.log(error, result);
  });

  await User.findByIdAndDelete(req.params.id);

  // Delete other data related to user -- later...
  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
