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

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS (works for both local and production)
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/analytics", analyticsRoutes);

// Absolute root path
const __root = path.resolve();

// Serve uploads
app.use("/uploads", express.static(path.join(__root, "uploads")));

// Serve React build
app.use(
  express.static(path.join(__root, "Frontend/job-application-portal/dist")),
);

// SPA fallback (only for frontend routes)
app.get(/^\/(?!api).*/, (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) return next();
  res.sendFile(
    path.join(__root, "Frontend/job-application-portal/dist/index.html"),
  );
});

// API 404
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
