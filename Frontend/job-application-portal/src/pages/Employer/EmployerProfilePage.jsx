import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Edit,
  Briefcase,
  Users,
  Calendar,
  Loader,
} from "lucide-react";
import EmployerLayout from "../../components/Layouts/EmployerLayout";
import { userAPI, analyticsAPI, jobAPI } from "../../utils/apiService";
import { useAuth } from "../../context/AuthContext";

const EmployerProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState(null);
  const [jobsCount, setJobsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, analyticsRes, jobsRes] = await Promise.all([
        userAPI.getMyProfile().catch(() => ({ success: false })),
        analyticsAPI.getMyAnalytics().catch(() => ({ success: false })),
        jobAPI.getEmployerJobs().catch(() => ({ success: false, jobs: [] })),
      ]);

      if (profileRes.success) {
        setProfile(profileRes.user);
      }
      if (analyticsRes.success) {
        setCounts(analyticsRes.counts || null);
      }
      if (jobsRes.success) {
        setJobsCount((jobsRes.jobs || []).length);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const displayData = profile || user;

  return (
    <EmployerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar / Company Logo */}
            <div className="absolute -top-12 left-6">
              <div className="relative">
                {displayData?.companyLogo || displayData?.avatar ? (
                  <img
                    src={`http://localhost:8000${displayData.companyLogo || displayData.avatar}`}
                    alt={displayData.companyName || displayData.name}
                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex justify-end pt-4">
              <Link
                to="/edit-profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>

            {/* Info - Based on User schema fields */}
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-slate-800">
                {displayData?.name || "Your Name"}
              </h1>
              <p className="text-lg text-emerald-600 font-medium mt-1">
                {displayData?.companyName || "Company Name"}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-slate-600">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {displayData?.email || "email@example.com"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Based on Analytics schema */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {jobsCount}
                </p>
                <p className="text-sm text-slate-500">Jobs Posted</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {counts?.totalApplications || 0}
                </p>
                <p className="text-sm text-slate-500">Applications Received</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {counts?.totalHired || 0}
                </p>
                <p className="text-sm text-slate-500">Total Hired</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Company Description - Based on User schema */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            About Company
          </h2>
          {displayData?.companyDescription ? (
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {displayData.companyDescription}
            </p>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">
                No company description added yet
              </p>
              <Link
                to="/edit-profile"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Edit className="w-4 h-4" />
                Add Description
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/post-job"
              className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <span>Post New Job</span>
            </Link>
            <Link
              to="/manage-jobs"
              className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <span>Manage Jobs</span>
            </Link>
            <Link
              to="/applications"
              className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>View Applications</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </EmployerLayout>
  );
};

export default EmployerProfilePage;
