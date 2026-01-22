const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  uploadResume,
  deleteResume,
  getPublicProfile,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const {
  uploadAvatar: avatarUpload,
  uploadResume: resumeUpload,
} = require("../middlewares/upload");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Private
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

router.put("/me/avatar", protect, avatarUpload.single("avatar"), uploadAvatar);

// Resume control (jobseeker)
router.put(
  "/me/resume",
  protect,
  authorizeRoles("jobseeker"),
  resumeUpload.single("resume"),
  uploadResume
);

router.delete("/me/resume", protect, authorizeRoles("jobseeker"), deleteResume);

// Public profile
router.get("/:id", getPublicProfile);
module.exports = router;
