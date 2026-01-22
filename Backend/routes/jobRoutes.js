const express = require("express");
const {
  createJob,
  getAllJobs,
  getJobById,
  getJobsEmployer,
} = require("../controllers/jobController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("employer"), createJob);
router.get("/", getAllJobs);
router.get("/:id", getJobById);

// employer only
router.get(
  "/employer/me",
  protect,
  authorizeRoles("employer"),
  getJobsEmployer,
);
module.exports = router;
