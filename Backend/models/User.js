const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer"],
      required: true,
    },
    avatar: String,
    resume: String,

    //for employer
    companyName: {
      type: String,
      trim: true,
    },
    companyDescription: String,
    companyLogo: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
