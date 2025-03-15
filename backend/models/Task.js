// models/Task.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    enum: ["days", "months"], // Add other units if needed
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending", // Automatically set "pending" for new tasks
  },
});

module.exports = mongoose.model("Task", taskSchema);










/*import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  unit: { type: String, enum: ['days', 'months'], default: 'days' },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

const Task = mongoose.model('Task', taskSchema);

export default Task;*/