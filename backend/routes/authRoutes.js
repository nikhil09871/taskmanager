const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Generate JWT Token Function
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
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
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
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



