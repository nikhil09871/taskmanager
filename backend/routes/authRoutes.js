const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticateUser = require("../middleware/authMiddleware");
const multer = require("multer");
const Admin = require("../models/Admin");
const path = require("path");
const Task = require ("../models/Task.js");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const sendResetEmail = require ("../utils/sendEmail.js");
const  sendAdminResetEmail = require ( "../utils/emailService.js");

require("dotenv").config();



// Generate JWT Token Function
const generateToken = (userId, role = "user") => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Password Validation Function
const isValidPassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

// Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!isValidPassword(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters, include an uppercase letter and a number" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Entered password:", password);
console.log("Stored password (hashed):", user.password);
console.log("Match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get User Profile
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    console.log("🔍 Fetching profile for user ID:", req.user.id);
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Configure Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store images in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed"), false);
  },
});

// Update profile picture route
router.post("/upload-profile", authenticateUser, upload.single("profilePicture"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({ message: "Profile picture updated", profilePicture: user.profilePicture });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Error uploading profile picture" });
  }
});

const authenticateAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};



router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(admin._id, "admin");

    res.status(200).json({
      message: "Admin login successful",
      admin: { id: admin._id, name: admin.name, email: admin.email },
      token,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/admin/tasks/:taskId", authenticateUser, authenticateAdmin, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Find and delete the task
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully", deletedTask });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Store in correct fields
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry

    await user.save();

    console.log("✅ Plain Token (Sent via email):", resetToken);
    console.log("🔐 Hashed Token (Stored in DB):", hashedToken);

    // Send reset email
    await sendResetEmail(email, resetToken);

    res.status(200).json({ message: "Reset link sent to your email." });
  } catch (error) {
    console.error("🔥 Internal Server Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// 🔐 Reset Password Route
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password, token } = req.body;

    if (!email || !password || !token) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Check token and expiry fields
    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // ✅ Hash received token for comparison
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // ✅ Compare hashed tokens
    if (user.resetPasswordToken !== hashedToken) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // ✅ Check if token is expired
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: "Token expired" });
    }

    // ✅ Hash and update new password
    user.password = await bcrypt.hash(password, 10);

    // ✅ Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log("New password (plain):", password);
    console.log("Saved password (hashed):", user.password);


    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Error during password reset:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // ✅ Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // 🔐 Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // 📌 Store token & expiration in DB
    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry

    await admin.save();

    console.log("✅ Plain Token (Sent via email):", resetToken);
    console.log("🔐 Hashed Token (Stored in DB):", hashedToken);

    // 📧 Send password reset email
    await sendAdminResetEmail(email, resetToken);

    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("🔥 Admin Forgot Password Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// 🔐 Admin Reset Password
router.post("/admin/reset-password", async (req, res) => {
  try {
    const { email, password, token } = req.body;

    // ✅ Validate required fields
    if (!email || !password || !token) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    // ✅ Check if reset token & expiry exist
    if (!admin.resetPasswordToken || !admin.resetPasswordExpires) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // ✅ Hash received token for comparison
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // ✅ Compare hashed tokens
    if (admin.resetPasswordToken !== hashedToken) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // ✅ Check if token is expired
    if (admin.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: "Token expired" });
    }

    // ✅ Hash and update new password
    admin.password = await bcrypt.hash(password, 10);

    // ✅ Clear reset token fields
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;

    await admin.save();

    console.log("New password (plain):", password);
    console.log("Saved password (hashed):", admin.password);

    res.status(200).json({ message: "Admin password reset successful" });
  } catch (error) {
    console.error("🔥 Admin Reset Password Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;










/*2nd code*/
/*const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Generate JWT Token Function
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log("📤 Signup Request Data:", req.body);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("🚫 User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Hashed Password:", hashedPassword);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    console.log("✅ User registered successfully");
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔍 Login Request Data:", { email, password });

    const user = await User.findOne({ email });

    if (!user) {
      console.error("❌ User not found");
      return res.status(400).json({ message: "User not found" });
    }

    console.log("✅ Stored Hashed Password:", user.password);

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password Match Status:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;*/















/*const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Signup Route
router.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;
    console.log("📤 Signup Request Data:", req.body); // Log incoming request
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.error("🚫 User already exists");
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("🔐 Hashed Password:", hashedPassword);
  
      const newUser = new User({ name, email, password: hashedPassword, role });
      await newUser.save();
  
      console.log("✅ User registered successfully");
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("❌ Signup Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

// Login Route


// POST: User Login
// Login Route
router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("🔍 Login Request Data:", { email, password });
  
      const user = await User.findOne({ email });
  
      if (!user) {
        console.error("❌ User not found");
        return res.status(400).json({ message: "User not found" });
      }
  
      console.log("✅ Stored Hashed Password:", user.password);
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("🔍 Password Match Status:", isMatch);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("❌ Error during login:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  

module.exports = router;*/



