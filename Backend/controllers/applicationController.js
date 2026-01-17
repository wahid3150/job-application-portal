const Application = require("../models/Application");
const Job = require("../models/Job");

exports.applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Check job exists & open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not available",
      });
    }

    // 2. Prevent duplicate application
    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // 3. Create application
    await Application.create({
      job: jobId,
      applicant: req.user._id,
      resume: req.user.resume || null,
      status: "applied",
    });

    return res.status(201).json({
      success: true,
      message: "Job applied successfully",
    });
  } catch (error) {
    // invalid ObjectId
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

exports.getMyApplication = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user._id,
    })
      .populate("job", "title location jobType salaryMin salaryMax isClosed")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

exports.getApplicationByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Check job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // 2. Ownership check (VERY IMPORTANT)
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these applications",
      });
    }

    // 3. Get applications for this job
    const applications = await Application.find({ job: jobId })
      .populate("applicant", "name email resume")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    //invalid ObjectId
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

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params; //application id
    const { status } = req.body;

    // 1. validate status
    const allowedStatuses = ["applied", "in-review", "accepted", "rejected"];
    // Mismatch nahi honi chahiye
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // 2. find application
    const application = await Application.findById(id).populate("job");
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // 3. Ownership check (job belongs to employer)
    if (application.job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this application",
      });
    }

    // 4. Update Status
    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      status: application.status,
    });
  } catch (error) {
    if (error.name == "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid application id",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
