import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Plus,
  Search,
  Filter,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import EmployerLayout from "../../components/Layouts/EmployerLayout";
import { jobAPI } from "../../utils/apiService";
import toast from "react-hot-toast";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ show: false, jobId: null });
  const [actionMenuId, setActionMenuId] = useState(null);
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");

  const jobTypes = useMemo(
    () => [
      { value: "", label: "All Types" },
      { value: "full-time", label: "Full Time" },
      { value: "part-time", label: "Part Time" },
      { value: "remote", label: "Remote" },
      { value: "internship", label: "Internship" },
      { value: "contract", label: "Contract" },
    ],
    [],
  );

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters = {
        keyword: debouncedKeyword || undefined,
        location: debouncedLocation || undefined,
        jobType: jobType || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      };
      const response = await jobAPI.getEmployerJobs(filters);
      if (response.success) {
        setJobs(response.jobs || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch jobs");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedKeyword, debouncedLocation, jobType, statusFilter]);

  // Debounce keyword and location inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(location);
    }, 500);
    return () => clearTimeout(timer);
  }, [location]);

  // Auto-apply filters when they change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleToggleStatus = async (jobId) => {
    try {
      const response = await jobAPI.toggleJobStatus(jobId);
      if (response.success) {
        setJobs((prev) =>
          prev.map((job) =>
            job._id === jobId ? { ...job, isClosed: response.isClosed } : job
          )
        );
        toast.success("Job status updated");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update job status");
    }
    setActionMenuId(null);
  };

  const handleClearFilters = () => {
    setKeyword("");
    setLocation("");
    setJobType("");
    setStatusFilter("all");
  };

  const handleDeleteJob = async () => {
    if (!deleteModal.jobId) return;

    try {
      const response = await jobAPI.deleteJob(deleteModal.jobId);
      if (response.success) {
        setJobs((prev) => prev.filter((job) => job._id !== deleteModal.jobId));
        toast.success("Job deleted successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete job");
    }
    setDeleteModal({ show: false, jobId: null });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatSalary = (min, max) => {
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Not specified";
  };

  const getJobTypeLabel = (type) => {
    const types = {
      "full-time": "Full Time",
      "part-time": "Part Time",
      remote: "Remote",
      internship: "Internship",
      contract: "Contract",
    };
    return types[type] || type;
  };

  const JobCard = ({ job }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden group relative"
    >
      {/* Gradient accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-100 to-purple-100 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Link
                to={`/employer/job/${job._id}`}
                className="text-lg font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors"
              >
                {job.title}
              </Link>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  !job.isClosed
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {job.isClosed ? "Closed" : "Open"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
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
              <span className="px-3 py-1 bg-linear-to-r from-blue-50 to-purple-50 text-blue-600 rounded-lg text-xs font-semibold border border-blue-200">
                {getJobTypeLabel(job.jobType)}
              </span>
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() =>
                setActionMenuId(actionMenuId === job._id ? null : job._id)
              }
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-slate-500" />
            </button>

            <AnimatePresence>
              {actionMenuId === job._id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-10"
                >
                  <Link
                    to={`/employer/job/${job._id}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Job
                  </Link>
                  <Link
                    to={`/edit-job/${job._id}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Job
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(job._id)}
                    className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-700 hover:bg-slate-50 transition-colors"
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
                  <hr className="my-2 border-slate-200" />
                  <button
                    onClick={() => {
                      setDeleteModal({ show: true, jobId: job._id });
                      setActionMenuId(null);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Job
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4">
          <Link
            to={`/employer/job/${job._id}`}
            className="group inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <Eye className="w-4 h-4" />
            View Details
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>
          <button
            type="button"
            onClick={() => handleToggleStatus(job._id)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium"
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
            type="button"
            onClick={() => setDeleteModal({ show: true, jobId: job._id })}
            className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <Link
            to={`/applications?jobId=${job._id}`}
            className="group inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <Users className="w-4 h-4" />
            <span>Applications</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500 ml-auto">
            <Calendar className="w-4 h-4" />
            Posted {formatDate(job.createdAt)}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Delete Confirmation Modal
  const DeleteModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => setDeleteModal({ show: false, jobId: null })}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 border-2 border-red-200">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Delete Job Posting?
        </h3>
        <p className="text-gray-600 text-center mb-6">
          This action cannot be undone. All applications for this job will also
          be deleted.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteModal({ show: false, jobId: null })}
            className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteJob}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

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
      <AnimatePresence>{deleteModal.show && <DeleteModal />}</AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Manage Jobs
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              View and manage all your job postings
            </p>
          </div>
          <Link
            to="/post-job"
            className="group inline-flex items-center gap-2 px-6 py-3.5 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            Post New Job
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Keyword Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by keyword..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Job Type */}
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors bg-white appearance-none"
              >
                {jobTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors bg-white"
              >
                <option value="all">All Status</option>
                <option value="open">Open Only</option>
                <option value="closed">Closed Only</option>
              </select>
            </div>

            <div className="ml-auto">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-30"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-linear-to-r from-blue-100 to-purple-100 shadow-sm">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
                <p className="text-sm text-gray-600 font-medium">Total Jobs</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-full blur-2xl opacity-30"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50 shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {jobs.filter((j) => !j.isClosed).length}
                </p>
                <p className="text-sm text-gray-600 font-medium">Open Jobs</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 rounded-full blur-2xl opacity-30"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-50 shadow-sm">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {jobs.filter((j) => j.isClosed).length}
                </p>
                <p className="text-sm text-gray-600 font-medium">Closed Jobs</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Jobs List */}
        {jobs.length > 0 ? (
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {jobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobCard job={job} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-blue-50/30 to-purple-50/30"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-linear-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {keyword || location || jobType || statusFilter !== "all"
                  ? "No jobs found"
                  : "No jobs posted yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {keyword || location || jobType || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start by creating your first job posting"}
              </p>
              {!keyword && !location && !jobType && statusFilter === "all" && (
                <Link
                  to="/post-job"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Create Job Posting
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </EmployerLayout>
  );
};

export default ManageJobs;
