const express = require("express");
const {
  createJob,
  getAllJobs,
  getJobById,
} = require("../controllers/jobController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("employer"), createJob);
router.get("/", getAllJobs);

module.exports = router;
