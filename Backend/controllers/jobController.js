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
    const {
      keyword,
      location,
      jobType,
      salaryMin,
      salaryMax,
      page = 1,
      limit = 10,
    } = req.query;

    let query = { isClosed: false };

    // Helper function to escape regex special characters
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (keyword) {
      const escapedKeyword = escapeRegex(keyword);
      query.$or = [
        { title: { $regex: escapedKeyword, $options: "i" } },
        { description: { $regex: escapedKeyword, $options: "i" } },
        { requirements: { $regex: escapedKeyword, $options: "i" } },
      ];
    }

    if (location) {
      const escapedLocation = escapeRegex(location);
      query.location = { $regex: escapedLocation, $options: "i" };
    }

    // Handle both single and multiple job types
    if (jobType) {
      const jobTypes = Array.isArray(jobType)
        ? jobType
        : jobType.split(",").map((t) => t.trim());
      if (jobTypes.length === 1) {
        query.jobType = jobTypes[0];
      } else if (jobTypes.length > 1) {
        query.jobType = { $in: jobTypes };
      }
    }

    // Salary range filter - find jobs where salary range overlaps with requested range
    if (salaryMin || salaryMax) {
      const salaryQuery = {};
      if (salaryMin && salaryMax) {
        // Both min and max provided: job's range should overlap with requested range
        salaryQuery.$or = [
          { salaryMin: { $lte: Number(salaryMax), $gte: Number(salaryMin) } },
          { salaryMax: { $lte: Number(salaryMax), $gte: Number(salaryMin) } },
          {
            $and: [
              { salaryMin: { $lte: Number(salaryMin) } },
              { salaryMax: { $gte: Number(salaryMax) } },
            ],
          },
        ];
      } else if (salaryMin) {
        // Only min provided: job's max should be >= requested min
        salaryQuery.$or = [
          { salaryMax: { $gte: Number(salaryMin) } },
          { salaryMin: { $gte: Number(salaryMin) } },
        ];
      } else if (salaryMax) {
        // Only max provided: job's min should be <= requested max
        salaryQuery.$or = [
          { salaryMin: { $lte: Number(salaryMax) } },
          { salaryMax: { $lte: Number(salaryMax) } },
        ];
      }
      if (Object.keys(salaryQuery).length > 0) {
        query.$and = query.$and || [];
        query.$and.push(salaryQuery);
      }
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
    const {
      keyword,
      location,
      jobType,
      status,
      page = 1,
      limit = 50,
    } = req.query;

    // Build query
    let query = { company: req.user._id };

    // Helper function to escape regex special characters
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Keyword search (title, description, requirements)
    if (keyword) {
      const escapedKeyword = escapeRegex(keyword);
      query.$or = [
        { title: { $regex: escapedKeyword, $options: "i" } },
        { description: { $regex: escapedKeyword, $options: "i" } },
        { requirements: { $regex: escapedKeyword, $options: "i" } },
      ];
    }

    // Location filter
    if (location) {
      const escapedLocation = escapeRegex(location);
      query.location = { $regex: escapedLocation, $options: "i" };
    }

    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }

    // Status filter (isClosed)
    if (status === "open") {
      query.isClosed = false;
    } else if (status === "closed") {
      query.isClosed = true;
    }
    // If status is "all" or not provided, show all

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
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

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this job",
      });
    }

    await job.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    job.isClosed = !job.isClosed;
    await job.save();

    return res.status(200).json({
      success: true,
      isClosed: job.isClosed,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
