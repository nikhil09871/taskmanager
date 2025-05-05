const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); 
const Task = require("../models/Task");
const authenticateUser = require("../middleware/authMiddleware");
const sendAdminResetEmail = require("../utils/emailService");
const bcrypt = require("bcryptjs");
const authenticateAdmin1 = require("../middleware/authenticateAdmin");


const crypto = require("crypto");


const authenticateAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};



// JWT Token Generation Function
const generateToken = (adminId) => {
  return jwt.sign({ id: adminId, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// ✅ Admin Signup Route (without password hashing)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create new admin (password is hashed in the model's pre-save hook)
    const newAdmin = new Admin({ name, email, password });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error in admin signup:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Admin Login Route (using comparePassword method)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the password using the method from the schema
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = generateToken(admin._id);

    res.status(200).json({
      message: "Admin login successful",
      admin: { id: admin._id, name: admin.name, email: admin.email },
      token,
    });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get All Users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Delete a User
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get All Tasks
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Approve/Reject a Task
router.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { decision } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "Invalid decision value" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = decision;
    await task.save();

    res.status(200).json({ message: `Task ${decision} successfully` });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/tasks/:taskId", authenticateUser, authenticateAdmin, async (req, res) => {
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

router.put("/approve/:taskId", authenticateUser, authenticateAdmin, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status: "approved" },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task approved successfully", task });
  } catch (error) {
    console.error("❌ Error approving task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/approved-tasks", authenticateUser, authenticateAdmin, async (req, res) => {
  try {
    const approvedTasks = await Task.find({ status: "approved" }).populate("userId", "name email");
    res.status(200).json(approvedTasks);
  } catch (error) {
    console.error("❌ Error fetching approved tasks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);
    res.status(200).json({ name: admin.name });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin details" });
  }
});

router.post("/forgot-password", async (req, res) => {
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

    // ✅ Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // ✅ Store reset token and expiration in DB
    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = Date.now() + 3600000; // 1-hour expiration
    await admin.save();

    console.log("✅ Plain Token (Send via email):", resetToken);

    // ✅ Send reset email
    await sendAdminResetEmail(admin.email, resetToken);

    res.status(200).json({ message: "Password reset link sent." });
  } catch (error) {
    console.error("🔥 Forgot Password Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, password, token } = req.body;

    if (!email || !password || !token) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // ✅ Check reset token and expiry
    if (!admin.resetPasswordToken || !admin.resetPasswordExpires) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // ✅ Validate token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    if (admin.resetPasswordToken !== hashedToken) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // ✅ Check expiration time
    if (admin.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }

    // ✅ Update password and clear token fields
    admin.password = await bcrypt.hash(password, 10);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;

    await admin.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("🔥 Admin Reset Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/create-group', authenticateAdmin1, async (req, res) => {
  const { projectTitle, users } = req.body;

  if (!projectTitle || !users || users.length === 0) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const task = await Task.findOne({ 
      name: { $regex: new RegExp(`^${projectTitle.trim()}$`, 'i') }, 
      status: 'approved' 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(201).json({ message: 'Group created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router;
