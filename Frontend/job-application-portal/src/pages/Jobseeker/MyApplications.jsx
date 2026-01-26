import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { applicationAPI } from "../../utils/apiService";
import JobseekerLayout from "../../components/Layouts/JobseekerLayout";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await applicationAPI.getMyApplications();
        if (res.success) {
          setApplications(res.applications || []);
        }
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to load applications");
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

  const statusMeta = (status) => {
    switch (status) {
      case "applied":
        return { label: "Applied", cls: "bg-amber-100 text-amber-700", Icon: Clock };
      case "in-review":
        return { label: "In Review", cls: "bg-blue-100 text-blue-700", Icon: Eye };
      case "accepted":
        return { label: "Accepted", cls: "bg-emerald-100 text-emerald-700", Icon: CheckCircle };
      case "rejected":
        return { label: "Rejected", cls: "bg-red-100 text-red-700", Icon: XCircle };
      default:
        return { label: status, cls: "bg-slate-100 text-slate-700", Icon: Clock };
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
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Applications</h1>
          <p className="text-slate-500 mt-1">Track your applied jobs</p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <Briefcase className="w-14 h-14 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No applications yet
            </h3>
            <p className="text-slate-500">
              Apply to jobs and they will show here.
            </p>
            <Link
              to="/find-jobs"
              className="inline-flex items-center justify-center mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
            >
              Find Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const job = app.job;
              const meta = statusMeta(app.status);
              const StatusIcon = meta.Icon;
              if (!job) return null;

              return (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
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
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${meta.cls}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {meta.label}
                    </span>
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

export default MyApplications;

