const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: String,
    },
    status: {
      type: String,
      enum: ["applied", "in-review", "accepted", "rejected"],
      default: "Applied",
    },
  },
  { timestamps: true }
);

// prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// performance indexes
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });
// I enforce one application per job per user using a compound unique index, added proper status states, and indexed the schema for read-heavy operations like applicant tracking.

module.exports = mongoose.model("Application", applicationSchema);
