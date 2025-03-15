const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bodyParser = require("express");

const cors = require("cors");

dotenv.config();
const app = express();



// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Use env for dynamic URL
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


app.use(cors(corsOptions));

// Middleware
app.use(express.json());

app.use(bodyParser.json());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/admin", adminRoutes);




// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Handle MongoDB disconnection
mongoose.connection.on("disconnected", () => {
  console.error("⚠️ MongoDB Disconnected");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
