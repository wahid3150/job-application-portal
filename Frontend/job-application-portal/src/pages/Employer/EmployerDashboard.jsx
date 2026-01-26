import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Users,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronRight,
  Loader,
  Building2,
  MapPin,
  DollarSign,
  User,
  Mail,
  Calendar,
  ArrowRight,
  Sparkles,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import EmployerLayout from "../../components/Layouts/EmployerLayout";
import { jobAPI, analyticsAPI } from "../../utils/apiService";
import { useAuth } from "../../context/AuthContext";

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMenuId, setActionMenuId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, jobId: null });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [analyticsRes, jobsRes] = await Promise.all([
        analyticsAPI.getMyAnalytics().catch(() => ({ success: false })),
        jobAPI.getEmployerJobs().catch(() => ({ success: false, jobs: [] })),
      ]);

      if (analyticsRes.success) {
        // Backend returns { counts, data }
        setCounts(analyticsRes.counts || null);
        if (analyticsRes.data?.recentJobs) {
          setRecentJobs(analyticsRes.data.recentJobs);
        }
        if (analyticsRes.data?.recentApplications) {
          setRecentApplications(analyticsRes.data.recentApplications);
        }
      }

      if (jobsRes.success) {
        setEmployerJobs(jobsRes.jobs || []);
        // Use jobs endpoint for recent list if analytics didn't provide it
        // Filter to show only open jobs
        if (!analyticsRes?.data?.recentJobs) {
          const openJobs = (jobsRes.jobs || []).filter((job) => !job.isClosed);
          setRecentJobs(openJobs.slice(0, 5));
        } else {
          // Filter analytics recentJobs to only show open jobs
          const openJobs = (analyticsRes.data.recentJobs || []).filter((job) => !job.isClosed);
          setRecentJobs(openJobs.slice(0, 5));
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSalary = (min, max) => {
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Not specified";
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const handleToggleStatus = async (jobId) => {
    try {
      const response = await jobAPI.toggleJobStatus(jobId);
      if (response.success) {
        setEmployerJobs((prev) =>
          prev.map((job) =>
            job._id === jobId ? { ...job, isClosed: response.isClosed } : job
          )
        );
        // Update recent jobs: remove closed jobs, only show open jobs
        setRecentJobs((prev) => {
          if (response.isClosed) {
            // Job was closed, remove it from recent jobs
            return prev.filter((job) => job._id !== jobId);
          } else {
            // Job was reopened, update it in the list
            return prev.map((job) =>
              job._id === jobId ? { ...job, isClosed: false } : job
            );
          }
        });
        toast.success(response.isClosed ? "Job closed" : "Job reopened");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update job status");
    }
    setActionMenuId(null);
  };

  const handleDeleteJob = async () => {
    if (!deleteModal.jobId) return;

    try {
      const response = await jobAPI.deleteJob(deleteModal.jobId);
      if (response.success) {
        setRecentJobs((prev) => prev.filter((job) => job._id !== deleteModal.jobId));
        setEmployerJobs((prev) => prev.filter((job) => job._id !== deleteModal.jobId));
        toast.success("Job deleted successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete job");
    }
    setDeleteModal({ show: false, jobId: null });
  };

  const statusMeta = (status) => {
    switch (status) {
      case "applied":
        return { label: "Applied", cls: "bg-amber-100 text-amber-700" };
      case "in-review":
        return { label: "In Review", cls: "bg-blue-100 text-blue-700" };
      case "accepted":
        return { label: "Accepted", cls: "bg-emerald-100 text-emerald-700" };
      case "rejected":
        return { label: "Rejected", cls: "bg-red-100 text-red-700" };
      default:
        return { label: status, cls: "bg-slate-100 text-slate-700" };
    }
  };

  const totalJobsPosted = employerJobs.length;
  const totalActiveJobs =
    typeof counts?.totalActiveJobs === "number"
      ? counts.totalActiveJobs
      : employerJobs.filter((j) => !j.isClosed).length;
  const totalApplications =
    typeof counts?.totalApplications === "number" ? counts.totalApplications : 0;
  const totalHired = typeof counts?.totalHired === "number" ? counts.totalHired : 0;
  const trends = counts?.trends || {};

  const statsCards = useMemo(() => [
    {
      title: "Total Jobs Posted",
      value: totalJobsPosted,
      icon: Briefcase,
      gradient: "from-blue-600 to-blue-700",
      bgColor: "bg-linear-to-br from-blue-50 to-blue-100/50",
      iconBg: "bg-linear-to-r from-blue-100 to-purple-100",
      iconColor: "text-blue-600",
      trend: trends.activeJobs,
    },
    {
      title: "Active Jobs",
      value: totalActiveJobs,
      icon: CheckCircle,
      gradient: "from-purple-600 to-purple-700",
      bgColor: "bg-linear-to-br from-purple-50 to-purple-100/50",
      iconBg: "bg-linear-to-r from-purple-100 to-pink-100",
      iconColor: "text-purple-600",
      trend: trends.activeJobs,
    },
    {
      title: "Applications Received",
      value: totalApplications,
      icon: Users,
      gradient: "from-blue-500 to-purple-600",
      bgColor: "bg-linear-to-br from-blue-50/50 to-purple-50/50",
      iconBg: "bg-linear-to-r from-blue-100 to-purple-100",
      iconColor: "text-blue-600",
      trend: trends.totalApplicants,
    },
    {
      title: "Total Hired",
      value: totalHired,
      icon: Sparkles,
      gradient: "from-indigo-600 to-purple-600",
      bgColor: "bg-linear-to-br from-indigo-50 to-purple-50/50",
      iconBg: "bg-linear-to-r from-indigo-100 to-purple-100",
      iconColor: "text-indigo-600",
      trend: trends.totalHired,
    },
  ], [totalJobsPosted, totalActiveJobs, totalApplications, totalHired, trends.activeJobs, trends.totalApplicants, trends.totalHired]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <EmployerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader className="w-12 h-12 text-emerald-500" />
          </motion.div>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="relative">
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-blue-50 to-purple-50 rounded-full blur-3xl opacity-10"></div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8 relative z-0"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-2"
              >
                Welcome back!{" "}
                <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {user?.name?.split(" ")[0] || "Employer"}
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-gray-600"
              >
                Here's what's happening with your job postings
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                to="/post-job"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
              >
                <Plus className="w-5 h-5" />
                <span>Post New Job</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
              className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden"
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${stat.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.iconBg} shadow-sm`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  {typeof stat.trend === "number" ? (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        stat.trend >= 0
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}
                      title="Last 7 days vs previous 7 days"
                    >
                      {stat.trend >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {Math.abs(stat.trend)}%
                    </span>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Content Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Jobs */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-blue-50/30 to-purple-50/30">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Recent Job Postings
              </h2>
              <Link
                to="/manage-jobs"
                className="group text-sm text-blue-600 hover:text-purple-600 font-medium flex items-center gap-1 transition-colors"
              >
                View All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {recentJobs.length > 0 ? (
              <div className="p-6 space-y-4">
                {recentJobs.slice(0, 5).map((job, index) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
                  >
                    {/* Header: Title, Status, Menu */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            !job.isClosed
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {job.isClosed ? "Closed" : "Open"}
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuId(actionMenuId === job._id ? null : job._id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Job Details: Location, Salary, Job Type */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      {job.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-200">
                        {job.jobType
                          ? job.jobType
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")
                          : "Full Time"}
                      </span>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Actions and Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/employer/job/${job._id}`}
                          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(job._id)}
                          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium"
                        >
                          {job.isClosed ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              Reopen
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              Close
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ show: true, jobId: job._id })}
                          className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                        <Link
                          to={`/applications?jobId=${job._id}`}
                          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
                        >
                          <Users className="w-4 h-4" />
                          Applications
                        </Link>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        Posted {formatDate(job.createdAt)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-linear-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600 mb-4 font-medium">No jobs posted yet</p>
                <Link
                  to="/post-job"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-purple-600 font-semibold transition-colors group"
                >
                  <Plus className="w-4 h-4" />
                  Create your first job posting
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Applications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-purple-50/30 to-pink-50/30">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Recent Applications
                </h2>
                <Link
                  to="/applications"
                  className="group text-sm text-purple-600 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
                >
                  View All
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              {recentApplications?.length ? (
                <div className="divide-y divide-gray-100">
                  {recentApplications.map((app) => {
                    const meta = statusMeta(app.status);
                    return (
                      <div key={app._id} className="p-4 hover:bg-linear-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200 group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {app.applicant?.name || "Applicant"}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {app.applicant?.email || ""}
                            </p>
                            <p className="text-sm text-gray-700 mt-2 truncate font-medium">
                              {app.job?.title || "Job"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${meta.cls} ${meta.cls.includes('amber') ? 'border-amber-200' : meta.cls.includes('blue') ? 'border-blue-200' : meta.cls.includes('emerald') ? 'border-green-200' : meta.cls.includes('red') ? 'border-red-200' : 'border-gray-200'}`}>
                              {meta.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(app.createdAt)}
                            </span>
                            {app.job?._id && (
                              <Link
                                to={`/applications?jobId=${app.job._id}`}
                                className="text-xs text-blue-600 hover:text-purple-600 font-medium transition-colors"
                              >
                                View list →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-linear-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-600 font-medium">No applications yet.</p>
                </div>
              )}
            </div>

            {/* Jobs Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Jobs Overview
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-linear-to-r from-green-50 to-emerald-50 border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                    <span className="text-gray-700 font-medium">Open Jobs</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">
                    {employerJobs.filter((j) => !j.isClosed).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-gray-700 font-medium">Closed Jobs</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">
                    {employerJobs.filter((j) => j.isClosed).length}
                  </span>
                </div>
              </div>
              <Link
                to="/manage-jobs"
                className="group w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-blue-600 font-medium rounded-xl transition-all duration-200 border border-gray-200 hover:border-blue-200"
              >
                Manage All Jobs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Job</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job posting? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, jobId: null })}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </EmployerLayout>
  );
};

export default EmployerDashboard;
