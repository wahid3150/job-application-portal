const fs = require("fs");
const path = require("path");
const User = require("../models/User");

exports.getMyProfile = async (req, res) => {
  try {
    // protect middleware already attached the user
    const user = req.user;

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,

        //Optional profile fields
        avatar: user.avatar || null,
        resume: user.resume || null,

        //employer specific
        companyName: user.companyName || null,
        companyDescription: user.companyDescription || null,
        companyLogo: user.companyLogo || null,
      },
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const user = req.user; //from protect middleware
    const { name, companyName, companyDescription } = req.body;

    // 1 allowed updates only
    if (name !== undefined) user.name = name;
    // 2 role-based updates
    if (user.role === "employer") {
      if (companyName !== undefined) user.companyName = companyName;
      if (companyDescription !== undefined)
        user.companyDescription = companyDescription;
    }

    // jobseeker cannot update company fields
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    req.user.avatar = `/uploads/avatars/${req.file.filename}`;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: req.user.avatar,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload resume",
      });
    }

    req.user.resume = `/uploads/resumes/${req.file.filename}`;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: req.user.resume,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    if (!req.user.resume) {
      return res.status(400).json({
        success: false,
        message: "No resume to delete",
      });
    }

    // absolute path
    const resumePath = path.join(__dirname, "..", req.user.resume);

    // delete file if exists
    if (fs.existsSync(resumePath)) {
      fs.unlinkSync(resumePath);
    }

    // remove from DB
    req.user.resume = undefined;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "name role avatar companyName companyDescription"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
