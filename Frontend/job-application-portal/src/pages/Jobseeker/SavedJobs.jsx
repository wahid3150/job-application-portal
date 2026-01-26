import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  Loader,
  Briefcase,
  MapPin,
  DollarSign,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { savedJobAPI } from "../../utils/apiService";
import JobseekerLayout from "../../components/Layouts/JobseekerLayout";

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await savedJobAPI.getSavedJobs();
        if (res.success) {
          setSavedJobs(res.savedJobs || []);
        }
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to load saved jobs");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const formatSalary = (min, max) => {
    if (typeof min === "number" && typeof max === "number") {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    if (typeof min === "number") return `From $${min.toLocaleString()}`;
    if (typeof max === "number") return `Up to $${max.toLocaleString()}`;
    return "Not specified";
  };

  const onRemove = async (jobId) => {
    try {
      const res = await savedJobAPI.removeSavedJob(jobId);
      if (res.success) {
        setSavedJobs((prev) => prev.filter((s) => s.job?._id !== jobId));
        toast.success("Removed from saved");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to remove");
    }
  };

  if (isLoading) {
    return (
      <JobseekerLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      </JobseekerLayout>
    );
  }

  return (
    <JobseekerLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/find-jobs"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 inline-flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Saved Jobs
          </h1>
          <div />
        </div>

        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <Heart className="w-14 h-14 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No saved jobs
            </h3>
            <p className="text-slate-500">Save jobs to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedJobs.map((saved) => {
              const job = saved.job;
              if (!job) return null;
              return (
                <motion.div
                  key={saved._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                >
                  <Link
                    to={`/job/${job._id}`}
                    className="text-lg font-semibold text-slate-800 hover:text-emerald-600 transition-colors block"
                  >
                    {job.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                    {job.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.isClosed
                          ? "bg-slate-100 text-slate-600"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {job.isClosed ? "Closed" : "Open"}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Link
                      to={`/job/${job._id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => onRemove(job._id)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </JobseekerLayout>
  );
};

export default SavedJobs;
