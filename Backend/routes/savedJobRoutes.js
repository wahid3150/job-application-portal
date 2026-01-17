const express = require("express");
const {
  savedJob,
  getSavedJobs,
  removeSavedJob,
} = require("../controllers/savedJobController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

// jobseeker only
router.post("/:jobId", protect, authorizeRoles("jobseeker"), savedJob);
router.get("/", protect, authorizeRoles("jobseeker"), getSavedJobs);
router.delete("/:jobId", protect, authorizeRoles("jobseeker"), removeSavedJob);

module.exports = router;
