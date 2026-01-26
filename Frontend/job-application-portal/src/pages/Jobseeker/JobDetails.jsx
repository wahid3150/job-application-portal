import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Loader,
  Heart,
  Send,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import { jobAPI, savedJobAPI, applicationAPI } from "../../utils/apiService";
import { useAuth } from "../../context/AuthContext";

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await jobAPI.getJobById(jobId);
        if (res.success) {
          setJob(res.job);
        } else {
          toast.error(res.message || "Job not found");
        }
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to load job");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [jobId]);

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

  const onSave = async () => {
    if (!job) return;
    if (!isAuthenticated) {
      toast("Please log in to save this job", {
        icon: "🔐",
        duration: 3500,
        style: { background: "#FEF3C7", color: "#92400E" },
      });
      navigate(`/login?redirect=/job/${jobId}`);
      return;
    }
    try {
      setIsSaving(true);
      const res = await savedJobAPI.saveJob(job._id);
      if (res.success) toast.success("Job saved to your list");
    } catch (e) {
      toast.error("Couldn't save job. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const onApply = async () => {
    if (!job) return;
    if (!isAuthenticated) {
      toast("Please log in to apply for this job", {
        icon: "🔐",
        duration: 3500,
        style: { background: "#FEF3C7", color: "#92400E" },
      });
      navigate(`/login?redirect=/job/${jobId}`);
      return;
    }
    try {
      setIsApplying(true);
      const res = await applicationAPI.applyForJob(job._id);
      if (res.success) toast.success("Application submitted successfully");
    } catch (e) {
      toast.error("Couldn't submit application. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        <Link
          to="/find-jobs"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-800">{job.title}</h1>
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
              </div>

              {job.company && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {job.company.companyName || job.company.name}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {job.company.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onSave}
                disabled={isSaving}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
                title={isAuthenticated ? "Save Job" : "Log in to save this job"}
              >
                <Heart className="w-5 h-5 text-rose-500" />
              </button>
              <button
                onClick={onApply}
                disabled={isApplying}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isApplying
                  ? "Applying..."
                  : isAuthenticated
                  ? "Apply"
                  : "Log in to Apply"}
              </button>
            </div>
          </div>
        </motion.div>

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
          <p className="text-slate-600 whitespace-pre-line">
            {job.requirements}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
