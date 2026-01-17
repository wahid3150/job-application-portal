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

exports.getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({
      jobseeker: req.user._id,
    })
      .populate("job", "title location jobType salaryMin salaryMax isClosed")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: savedJobs.length,
      savedJobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.removeSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const deleted = await SavedJob.findOneAndDelete({
      jobseeker: req.user._id,
      job: jobId,
    });

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "Saved job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job removed from saved list",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
