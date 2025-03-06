// server.js or app.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const cors = require("cors");

dotenv.config();
const app = express();

//app.use(cors({ origin: "http://localhost:3000", credentials: true }));

const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend URL
  methods: "GET,POST,PUT,DELETE",
  credentials: true, // Allow cookies or auth headers if needed
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
