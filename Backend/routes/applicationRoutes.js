const express = require("express");
const { applyJob } = require("../controllers/applicationController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

//Job seeker only
router.post("/:jobId", protect, authorizeRoles("jobseeker"), applyJob);

module.exports = router;
