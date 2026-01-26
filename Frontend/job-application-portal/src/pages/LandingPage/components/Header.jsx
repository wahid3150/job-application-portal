import React from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-y-gray-100"
    >
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">JobPortal</span>
          </div>
          {/* Navigation links - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  if (user?.role === "jobseeker") {
                    navigate("/jobseeker-dashboard");
                  } else if (user?.role === "employer") {
                    navigate("/employer-dashboard");
                  } else {
                    navigate("/find-jobs");
                  }
                } else {
                  navigate("/find-jobs");
                }
              }}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Find Jobs
            </button>
            <button
              onClick={() => {
                if (isAuthenticated && user?.role === "employer") {
                  navigate("/employer-dashboard");
                } else {
                  navigate("/login");
                }
              }}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              For Employers
            </button>
          </nav>

          {/* Auth Button */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text text-gray-700">
                  Welcome, {user?.name || user?.fullName || "User"}
                </span>
                <Link
                  to={
                    user?.role === "employer"
                      ? "/employer-dashboard"
                      : user?.role === "jobseeker"
                      ? "/jobseeker-dashboard"
                      : "/find-jobs"
                  }
                  className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
