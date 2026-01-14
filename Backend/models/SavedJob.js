const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema(
  {
    jobseeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate saved jobs
savedJobSchema.index({ jobseeker: 1, job: 1 }, { unique: true });
// I used a separate SavedJob collection with a compound unique index to prevent users from saving the same job multiple times. This enforces data integrity at the database level and avoids race conditions.

module.exports = mongoose.model("SavedJob", savedJobSchema);
