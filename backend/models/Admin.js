const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
},{ timestamps: true });

// 🔒 Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.password.startsWith("$2b$")) {
      return next();
    }
  
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// 🔐 Compare input password with hashed password
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

adminSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and store it
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set token expiration (1 hour)
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour in milliseconds

  return resetToken; // Send plain token via email
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
