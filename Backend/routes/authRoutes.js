const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validate");
const registerSchema = require("../validators/registerSchema");
const loginSchema = require("../validators/loginSchema");

const router = express.Router();

router.post("/register", validateBody(registerSchema), registerUser);
router.post("/login", validateBody(loginSchema), loginUser);
router.get("/me", protect, getMe);

module.exports = router;
