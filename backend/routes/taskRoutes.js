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


// routes/authRoutes.js (Example)
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name role');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// In routes/taskRoutes.js
router.delete('/:taskId', authenticateUser , async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByIdAndDelete(taskId);

    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error while deleting task' });
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated
    const tasks = await Task.find({ userId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;

