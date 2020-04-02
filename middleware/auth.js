const ErrorResponse = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");
const asyncHandler = require('express-async-handler');
const User = require('../models/User');


exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check specific character
  if (
    req.headers.authorization &&
    req.headers.authorization.startWith("Bearer")
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // else if(req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if(!token){
    return next(
      new ErrorResponse(
        `Not authorized to access this route.`,
        401
      )
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(
      new ErrorResponse(
        `Not authorized to access this route.`,
        401
      )
    );
  }
});

// Grant access to specific roles
exports.isAuthorize = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route.`,
          401
        )
      );
    }

    next();
  }
};
