const Job = require("../models/Job");

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      jobType,
      salaryMin,
      salaryMax,
    } = req.body;

    // 1. Create job
    const job = await Job.create({
      title,
      description,
      requirements,
      location,
      jobType,
      salaryMin,
      salaryMax,
      company: req.user._id, // logged in employer
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      jobId: job._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
