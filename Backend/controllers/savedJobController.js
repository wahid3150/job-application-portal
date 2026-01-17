const Job = require("../models/Job");
const SavedJob = require("../models/SavedJob");

exports.savedJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // check job exists
    const job = await Job.findById(jobId);
    if (!job || job.isClosed) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    await SavedJob.create({
      jobseeker: req.user._id,
      job: jobId,
    });

    return res.status(201).json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    // duplicate save (unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Job already saved",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
