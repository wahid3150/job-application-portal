const express = require("express");
const { savedJob, getSavedJobs } = require("../controllers/savedJobController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

// jobseeker only
router.post("/:jobId", protect, authorizeRoles("jobseeker"), savedJob);
router.get("/", protect, authorizeRoles("jobseeker"), getSavedJobs);

module.exports = router;
