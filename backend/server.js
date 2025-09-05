const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import Routes
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Root Route for testing
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI) // The corrected, simpler connection call
  .then(() => {
    // Only start listening for requests after the database connection is successful
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`✅ MongoDB Connected & Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit the process with a failure code
  });