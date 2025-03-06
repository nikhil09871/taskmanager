const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const authenticateUser = require("../middleware/authMiddleware");

// Add Task Route
router.post("/add", authenticateUser, async (req, res) => {
  try {
    const { name, duration, unit, description, startDate, endDate } = req.body;

    // Validate input
    if (!name || !duration || !unit || !description || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const newTask = new Task({
      userId: req.user.id,
      name,
      duration,
      unit,
      description,
      startDate,
      endDate,
    });

    await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error("Task creation error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// Get all tasks
router.get("/", authenticateUser, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.status(200).json(tasks); // Ensure always sending an array
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json([]);
  }
});

// Update Task
router.put("/update/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, unit, description, startDate, endDate } = req.body;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { name, duration, unit, description, startDate, endDate },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
});

// Delete Task
router.delete("/delete/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
});

module.exports = router;









/*const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const authenticateUser = require("../middleware/authMiddleware"); // Ensure this path is correct

// Add Task Route (protected by authentication)
router.post("/add", authenticateUser, async (req, res) => {
  try {
    const { name, duration, unit, description, startDate, endDate } = req.body;

    // Ensure all fields are provided
    if (!name || !duration || !unit || !description || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTask = new Task({
      userId: req.user.id,
      name,
      duration,
      unit,
      description,
      startDate,
      endDate,
    });

    await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error("Task creation error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Get all tasks for logged-in user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ userId });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

module.exports = router;*/