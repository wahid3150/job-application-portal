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

exports.getAllJobs = async (req, res) => {
  try {
    const { keyword, location, jobType, page = 1, limit = 10 } = req.query;

    let query = { isClosed: false };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { requirements: { $regex: keyword, $options: "i" } },
      ];
    }

    if (location) {
      query.location = location;
    }

    if (jobType) {
      query.jobType = jobType;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(query)
      .populate("company", "name companyName companyLogo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(query);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate(
      "company",
      "name companyName companyDescription companyLogo",
    );
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Optional: hide closed jobs from public
    if (job.isClosed) {
      return res.status(404).json({
        success: false,
        message: "Job not available",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    // invalid ObjectId case
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

exports.getJobsEmployer = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Ownership check
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this job",
      });
    }

    const updateJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      job: updateJob,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
