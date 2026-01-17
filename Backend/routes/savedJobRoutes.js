const express = require("express");
const { savedJob } = require("../controllers/savedJobController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

// jobseeker only
router.post("/:jobId", protect, authorizeRoles("jobseeker"), savedJob);

module.exports = router;
