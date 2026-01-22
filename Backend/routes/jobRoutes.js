const express = require("express");
const {
  createJob,
  getAllJobs,
  getJobById,
  getJobsEmployer,
  updateJob,
  deleteJob,
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

router.put("/:id", protect, authorizeRoles("employer"), updateJob);
router.delete("/:id", protect, authorizeRoles("employer"), deleteJob);

module.exports = router;
