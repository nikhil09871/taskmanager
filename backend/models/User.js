const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    
  },
  profilePicture: { type: String, default: "" },

  // Fields for password reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is not already hashed
  if (!this.isModified("password") || this.password.startsWith("$2b$")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Method to generate a reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and store it
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set token expiration (1 hour)
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour in milliseconds

  return resetToken; // Send plain token via email
};

const User = mongoose.model("User", userSchema);
module.exports = User;
