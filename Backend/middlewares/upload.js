const multer = require("multer");
const path = require("path");

// Avatar storage

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/avatars");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `avatar-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Resume storage

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `resume-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

exports.uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
});

exports.uploadResume = multer({
  storage: resumeStorage,
  fileFilter,
});
