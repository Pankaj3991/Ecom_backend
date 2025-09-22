const ErrorHandler = require("../services/errorHandler");
const catchAsyncErrors = require("./catchAsync");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware to check if the user is logged in
exports.isLoggedIn = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(); // No token, proceed to registration or login
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(); // Invalid token, allow to proceed
    }

    // Token is valid, user is already logged in
    return next(new ErrorHandler("User is already logged in, Please logout to login another user ", 400));
  });
};

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData.id);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };
};