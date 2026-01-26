import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Loader,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronDown,
  Briefcase,
  ExternalLink,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import EmployerLayout from "../../components/Layouts/EmployerLayout";
import { applicationAPI, jobAPI } from "../../utils/apiService";
import toast from "react-hot-toast";

const ApplicationViewer = () => {
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get("jobId");

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(jobIdParam || "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (jobIdParam) {
        const [jobsRes, appRes] = await Promise.all([
          jobAPI.getEmployerJobs(),
          applicationAPI.getJobApplications(jobIdParam).catch(() => null),
        ]);
        if (!jobsRes.success) {
          setIsLoading(false);
          return;
        }
        const jobList = jobsRes.jobs || [];
        setJobs(jobList);
        const job = jobList.find((j) => j._id === jobIdParam);
        const list =
          appRes?.success && appRes?.applications && job
            ? appRes.applications.map((app) => ({ ...app, jobTitle: job.title, jobId: job._id }))
            : [];
        setApplications(list);
      } else {
        const jobsRes = await jobAPI.getEmployerJobs();
        if (!jobsRes.success) {
          setIsLoading(false);
          return;
        }
        const jobList = jobsRes.jobs || [];
        setJobs(jobList);
        const results = await Promise.all(
          jobList.map((job) =>
            applicationAPI.getJobApplications(job._id).then((appRes) => ({ job, appRes })).catch(() => ({ job, appRes: null }))
          )
        );
        const allApplications = results.flatMap(({ job, appRes }) =>
          appRes?.success && appRes?.applications
            ? appRes.applications.map((app) => ({ ...app, jobTitle: job.title, jobId: job._id }))
            : []
        );
        setApplications(allApplications);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [jobIdParam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (jobIdParam) {
      setSelectedJob(jobIdParam);
    }
  }, [jobIdParam]);

  // Application status values from schema: "applied", "in-review", "accepted", "rejected"
  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      const response = await applicationAPI.updateApplicationStatus(
        applicationId,
        newStatus
      );
      if (response.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        );
        toast.success(`Application marked as ${newStatus}`);
        if (selectedApplication?._id === applicationId) {
          setSelectedApplication((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesJob = selectedJob === "all" || app.jobId === selectedJob;
    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      app.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesJob && matchesStatus && matchesSearch;
  });

  // Status colors based on schema values
  const getStatusColor = (status) => {
    switch (status) {
      case "applied":
        return "bg-amber-100 text-amber-700";
      case "in-review":
        return "bg-blue-100 text-blue-700";
      case "accepted":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "applied":
        return Clock;
      case "in-review":
        return Eye;
      case "accepted":
        return CheckCircle;
      case "rejected":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "applied":
        return "Applied";
      case "in-review":
        return "In Review";
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Application Detail Modal
  const ApplicationDetail = ({ application, onClose }) => {
    const StatusIcon = getStatusIcon(application.status);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between bg-linear-to-r from-blue-50/30 to-purple-50/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {application.applicant?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {application.applicant?.name || "Applicant"}
                </h2>
                <p className="text-gray-600">
                  Applied for {application.jobTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border ${getStatusColor(
                  application.status
                )} ${
                  application.status === "applied"
                    ? "border-amber-200"
                    : application.status === "in-review"
                    ? "border-blue-200"
                    : application.status === "accepted"
                    ? "border-green-200"
                    : "border-red-200"
                }`}
              >
                <StatusIcon className="w-4 h-4" />
                {getStatusLabel(application.status)}
              </span>
              <span className="text-sm text-gray-600">
                Applied on {formatDate(application.createdAt)}
              </span>
            </div>

            {/* Contact Info */}
            <div className="bg-linear-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-5 space-y-3 border border-blue-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href={`mailto:${application.applicant?.email}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  <Mail className="w-5 h-5" />
                  {application.applicant?.email || "No email"}
                </a>
              </div>
            </div>

            {/* Resume - from Application schema or User schema */}
            {(application.resume || application.applicant?.resume) && (
              <div className="bg-linear-to-r from-purple-50/50 to-pink-50/50 rounded-xl p-5 border border-purple-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Resume
                </h3>
                <a
                  href={`http://localhost:8000${application.resume || application.applicant.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
                >
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>View Resume</span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            )}
          </div>

          {/* Actions - based on schema status values */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex flex-wrap gap-3 bg-linear-to-r from-blue-50/30 to-purple-50/30">
            {application.status === "applied" && (
              <button
                onClick={() =>
                  handleUpdateStatus(application._id, "in-review")
                }
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Eye className="w-5 h-5" />
                Mark In Review
              </button>
            )}
            {application.status !== "accepted" && (
              <button
                onClick={() =>
                  handleUpdateStatus(application._id, "accepted")
                }
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                Accept
              </button>
            )}
            {application.status !== "rejected" && (
              <button
                onClick={() =>
                  handleUpdateStatus(application._id, "rejected")
                }
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
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
      <AnimatePresence>
        {selectedApplication && (
          <ApplicationDetail
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Applications</h1>
          <p className="text-lg text-gray-600 mt-1">
            Review and manage job applications
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Job Filter */}
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors bg-white appearance-none"
              >
                <option value="all">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Status Filter - using schema values */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors bg-white appearance-none"
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="in-review">In Review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {applications.length}
                </p>
                <p className="text-sm text-gray-600 font-medium">Total</p>
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
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-full blur-2xl opacity-30"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 shadow-sm">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {applications.filter((a) => a.status === "applied").length}
                </p>
                <p className="text-sm text-gray-600 font-medium">Applied</p>
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
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-full blur-2xl opacity-30"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50 shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {applications.filter((a) => a.status === "accepted").length}
                </p>
                <p className="text-sm text-gray-600 font-medium">Accepted</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-30"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-50 shadow-sm">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {applications.filter((a) => a.status === "rejected").length}
                </p>
                <p className="text-sm text-gray-600 font-medium">Rejected</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-blue-50/50 to-purple-50/50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                      Applicant
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                      Job Position
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                      Applied Date
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApplications.map((application, index) => {
                    const StatusIcon = getStatusIcon(application.status);
                    return (
                      <motion.tr
                        key={application._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-linear-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                              {application.applicant?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "A"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {application.applicant?.name || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {application.applicant?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-800 font-medium">
                            {application.jobTitle}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-600">
                            {formatDate(application.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                              application.status
                            )} ${
                              application.status === "applied"
                                ? "border-amber-200"
                                : application.status === "in-review"
                                ? "border-blue-200"
                                : application.status === "accepted"
                                ? "border-green-200"
                                : "border-red-200"
                            }`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {getStatusLabel(application.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="group inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-blue-600 font-medium rounded-lg transition-all border border-gray-200 hover:border-blue-200"
                          >
                            <Eye className="w-4 h-4" />
                            View
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-blue-50/30 to-purple-50/30"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-linear-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-600">
                {applications.length === 0
                  ? "You haven't received any applications yet"
                  : "Try adjusting your filters to see more results"}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </EmployerLayout>
  );
};

export default ApplicationViewer;
