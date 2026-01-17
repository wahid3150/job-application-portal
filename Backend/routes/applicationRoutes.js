const express = require("express");
const {
  applyJob,
  getMyApplication,
  getApplicationByJob,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

//Job seeker only
router.post("/:jobId", protect, authorizeRoles("jobseeker"), applyJob);
router.get("/me", protect, authorizeRoles("jobseeker"), getMyApplication);

//Employer
router.get(
  "/job/:jobId",
  protect,
  authorizeRoles("employer"),
  getApplicationByJob
);

//jobseeker application status changing api
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("employer"),
  updateApplicationStatus
);

module.exports = router;
