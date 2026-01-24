const multer = require("multer");
const path = require("path");

// Avatar storage for authenticated users (profile updates)
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `avatar-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

// Avatar storage for registration (unauthenticated users)
const registrationAvatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    cb(null, `avatar-${random}-${timestamp}${path.extname(file.originalname)}`);
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
      `resume-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`,
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

// Separate uploader for registration (no authentication required)
exports.uploadAvatarRegistration = multer({
  storage: registrationAvatarStorage,
  fileFilter,
});

exports.uploadResume = multer({
  storage: resumeStorage,
  fileFilter,
});
