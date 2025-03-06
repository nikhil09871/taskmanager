// routes/auth.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Sign Up Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists." });

    // Create new user
    const newUser = new User({ name, email, password, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error. Try again." });
  }
});

export default router;
