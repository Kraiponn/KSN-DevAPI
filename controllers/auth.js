const asyncHandler = require("express-async-handler");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// @desc    Get all auth
// @route   GET /api/v1/auth
// @access  Public
exports.getUsers = asyncHandler(async (req, res, next) => {
  const user = await User.find();

  res.status(200).json({
    success: true,
    count: user.length,
    data: user
  });
});

// @desc    Get single user
// @route   GET /api/v1/auth/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check validation email, name and password
  if (!name || !email || !password) {
    return next(
      new ErrorResponse(`Please provide a name, email and password`, 400)
    );
  }

  const user = await User.create(req.body);

  sendTokenResponse(user, 201, res);
});

// @desc    Logged in
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validation email and password
  if (!email || !password) {
    return next(new ErrorResponse(`Please provide an email and password`, 400));
  }

  let user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  // Check match password
  if (!user.matchPassword(password)) {
    return next(new ErrorResponse(`Password is incorect`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    logged user out
// @route   GET /api/v1/auth/logout
// @access  Public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 60 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

/****************************
 * Send response with token
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user
    });
};
