const Task = require('../models/Task');

// Create Task
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newTask = await Task.create({
      title,
      description,
      assignedTo: req.user.userId, // From the authenticated user
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};

// Get All Tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.userId });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

module.exports = { createTask, getTasks };
