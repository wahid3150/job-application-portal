require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const savedJobRoutes = require("./routes/savedJobRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();
app.disable("x-powered-by");

//Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/analytics", analyticsRoutes);

// Serve uploads folder
app.use("/uploads", express.static("uploads"));

// Serve static files from React build
app.use(
  express.static(
    path.join(__dirname, "../Frontend/job-application-portal/dist"),
  ),
);

// Fallback to React app
app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "../Frontend/job-application-portal/dist/index.html"),
  );
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
