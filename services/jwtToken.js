// Create Token and saving in cookie
const jwt = require("jsonwebtoken");
const sendToken = (user, statusCode, res) => {
  // Generating token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production", // ⬅ only true in prod (Render gives HTTPS)
    secure: true,
    // sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    sameSite:"Lax",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      message: `Welcome, ${user.name}`,
      token,
    });
};

module.exports = sendToken;
