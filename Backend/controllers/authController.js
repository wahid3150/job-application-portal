const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { message } = require("../validators/registerSchema");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName, companyDescription } =
      req.body;

    // 1. Check duplication email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      companyName,
      companyDescription,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
