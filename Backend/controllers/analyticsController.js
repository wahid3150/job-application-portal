const Application = require("../models/Application");
const Job = require("../models/Job");

const getTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

exports.getMyAnalytics = async (req, res) => {
  try {
    const companyId = req.user._id;

    //Date range
    const now = new Date();

    const last7Days = new Date();
    last7Days.setDate(now.getDate() - 7);

    const prev7Days = new Date();
    prev7Days.setDate(now.getDate() - 14);

    // Job Ids
    const jobs = await Job.find({ company: companyId }).select("_id");
    const jobIds = jobs.map((job) => job._id);

    // Total counts
    const totalActiveJobs = await Job.countDocuments({
      company: companyId,
      isClosed: false,
    });
    const totalApplications = await Application.countDocuments({
      job: { $in: jobIds },
    });
    const totalHired = await Application.countDocuments({
      job: { $in: jobIds },
      status: "accepted",
    });

    //Active jobs
    const activeJobsLast7 = await Job.countDocuments({
      company: companyId,
      createdAt: { $gte: last7Days },
    });
    const activeJobsPrev7 = await Job.countDocuments({
      company: companyId,
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });

    //Applications
    const applicationsLast7 = await Application.countDocuments({
      job: { $in: jobIds },
      createdAt: { $gte: last7Days },
    });
    const applicationsPrev7 = await Application.countDocuments({
      job: { $in: jobIds },
      createdAt: { $gte: last7Days },
    });

    //Hired
    const hiredLast7 = await Application.countDocuments({
      job: { $in: jobIds },
      status: "accepted",
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });
    const hiredPrev7 = await Application.countDocuments({
      job: { $in: jobIds },
      status: "accepted",
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });

    //Recent Data
    const recentJobs = await Job.find({ company: companyId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title location jobType isClosed createdAt");

    const recentApplications = await Job.find({
      job: { $in: jobIds },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("applicant", "name email avatar")
      .populate("job", "title");

    return res.status(200).json({
      success: true,
      counts: {
        totalActiveJobs,
        totalApplications,
        totalHired,
        trends: {
          activeJobs: getTrend(activeJobsLast7, activeJobsPrev7),
          totalApplicants: getTrend(applicationsLast7, applicationsPrev7),
          totalHired: getTrend(hiredLast7, hiredPrev7),
        },
      },
      data: {
        recentJobs,
        recentApplications,
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
