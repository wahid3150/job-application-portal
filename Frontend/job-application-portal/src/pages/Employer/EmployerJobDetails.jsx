import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  Loader,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import EmployerLayout from "../../components/Layouts/EmployerLayout";
import { jobAPI } from "../../utils/apiService";
import toast from "react-hot-toast";

const EmployerJobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        let res = await jobAPI.getJobById(jobId).catch(() => ({}));
        if (res.success && res.job) {
          setJob(res.job);
          return;
        }
        res = await jobAPI.getEmployerJobs().catch(() => ({}));
        const found = (res.jobs || []).find((j) => j._id === jobId);
        if (found) {
          setJob(found);
          return;
        }
        toast.error("Job not found");
        navigate("/manage-jobs");
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to load job");
        navigate("/manage-jobs");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [jobId, navigate]);

  const salaryText = useMemo(() => {
    if (!job) return "";
    const min = job.salaryMin;
    const max = job.salaryMax;
    if (typeof min === "number" && typeof max === "number") {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    if (typeof min === "number") return `From $${min.toLocaleString()}`;
    if (typeof max === "number") return `Up to $${max.toLocaleString()}`;
    return "Not specified";
  }, [job]);

  const jobTypeLabel = useMemo(() => {
    if (!job) return "";
    const map = {
      "full-time": "Full Time",
      "part-time": "Part Time",
      remote: "Remote",
      internship: "Internship",
      contract: "Contract",
    };
    return map[job.jobType] || job.jobType;
  }, [job]);

  const onToggle = async () => {
    if (!job) return;
    try {
      setIsToggling(true);
      const res = await jobAPI.toggleJobStatus(job._id);
      if (res.success) {
        setJob((prev) => ({ ...prev, isClosed: res.isClosed }));
        toast.success(res.isClosed ? "Job closed" : "Job reopened");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to toggle job status");
    } finally {
      setIsToggling(false);
    }
  };

  const onDelete = async () => {
    if (!job) return;
    try {
      setIsDeleting(true);
      const res = await jobAPI.deleteJob(job._id);
      if (res.success) {
        toast.success("Job deleted");
        navigate("/manage-jobs");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete job");
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
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

  if (!job) {
    return null;
  }

  return (
    <EmployerLayout>
      <AnimatePresence>
        {deleteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                Delete this job?
              </h3>
              <p className="text-slate-600 text-center mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/edit-job/${job._id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={onToggle}
              disabled={isToggling}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
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
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-800 truncate">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-600">
                {job.location && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {jobTypeLabel}
                </span>
                <span className="inline-flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {salaryText}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    job.isClosed
                      ? "bg-slate-100 text-slate-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {job.isClosed ? "Closed" : "Open"}
                </span>
              </div>
            </div>
            <Link
              to={`/applications?jobId=${job._id}`}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
            >
              View Applications
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Description
          </h2>
          <p className="text-slate-600 whitespace-pre-line">{job.description}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Requirements
          </h2>
          <p className="text-slate-600 whitespace-pre-line">{job.requirements}</p>
        </div>
      </motion.div>
    </EmployerLayout>
  );
};

export default EmployerJobDetails;

