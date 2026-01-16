const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { validateBody } = require("../middlewares/validate");
const registerSchema = require("../validators/registerSchema");
const loginSchema = require("../validators/loginSchema");

const router = express.Router();

router.post("/register", validateBody(registerSchema), registerUser);
router.post("/login", validateBody(loginSchema), loginUser);

module.exports = router;
