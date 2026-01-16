const express = require("express");
const { getMyProfile } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/me", protect, getMyProfile);

module.exports = router;
