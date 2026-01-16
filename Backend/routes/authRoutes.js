const express = require("express");
const { registerUser } = require("../controllers/authController");
const { validateBody } = require("../middlewares/validate");
const registerSchema = require("../validators/registerSchema");

const router = express.Router();

router.post("/register", validateBody(registerSchema), registerUser);

module.exports = router;
