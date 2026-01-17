const express = require("express");
const {
  applyJob,
  getMyApplication,
} = require("../controllers/applicationController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

//Job seeker only
router.post("/:jobId", protect, authorizeRoles("jobseeker"), applyJob);
router.get("/me", protect, authorizeRoles("jobseeker"), getMyApplication);

module.exports = router;
