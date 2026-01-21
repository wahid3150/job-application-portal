const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadAvatar: avatarUpload } = require("../middlewares/upload");

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

router.put("/me/avatar", protect, avatarUpload.single("avatar"), uploadAvatar);

module.exports = router;
