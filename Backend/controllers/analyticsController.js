const Application = require("../models/Application");
const Job = require("../models/Job");

exports.getMyAnalytics = async (req, res) => {
  try {
    const employerId = req.user._id;

    // 1. total jobs posted
    const totalJobsPosted = await Job.countDocuments({
      company: employerId,
    });

    // 2. get employer job IDs
    const jobs = await Job.find({ company: employerId }).select("_id");
    const jobIds = jobs.map((job) => job._id);

    // 3. total applications received
    const totalApplicationsReceived = await Application.countDocuments({
      job: { $in: jobIds },
    });

    // 4. total hired
    const totalHired = await Application.countDocuments({
      job: { $in: jobIds },
      status: "accepted",
    });

    return res.status(200).json({
      success: true,
      analytics: {
        totalJobsPosted,
        totalApplicationsReceived,
        totalHired,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POORA FLOW EK LINE ME
// Employer ID
// → Employer ki jobs
// → Un jobs ki applications
// → Un applications me accepted
