const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  uploadResume,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const {
  uploadAvatar: avatarUpload,
  uploadResume: resumeUpload,
} = require("../middlewares/upload");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

router.put("/me/avatar", protect, avatarUpload.single("avatar"), uploadAvatar);
router.put(
  "/me/resume",
  protect,
  authorizeRoles("jobseeker"),
  resumeUpload.single("resume"),
  uploadResume
);

module.exports = router;
