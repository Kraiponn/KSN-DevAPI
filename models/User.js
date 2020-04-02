const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 100,
    required: [true, "Please add a name"]
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please add an email"],
    match: [
      //,
      "Please add a valid email"
    ]
  },
  password: {
    type: String,
    minlength: 6,
    required: [true, "Please add a password"],
    select: false
  },
  role: {
    type: String,
    enum: ["user", "publisher"],
    default: "user"
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password
userSchema.pre("save", async next => {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Get JWT Token
userSchema.methods.getSignJwtToken = () => {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Check match password entered
userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

// Get reset password token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire reset token
  this.resetPasswordExpire = Date.now() + 10 * 60 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
