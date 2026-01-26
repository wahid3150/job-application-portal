import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, CheckCircle, Loader } from "lucide-react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../utils/apiService";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);

      if (response.success) {
        // Store token and user in context and localStorage
        login(response.user, response.token);
        setLoginSuccess(true);

        // Redirect based on user role or return URL
        setTimeout(() => {
          toast.success("Login successful!");
          if (response.user.role === "employer") {
            navigate("/employer-dashboard");
          } else if (response.user.role === "jobseeker") {
            // If they came from a job page, send them back after login
            const safeRedirect = redirectTo?.startsWith("/job/") ? redirectTo : "/jobseeker-dashboard";
            navigate(safeRedirect);
          } else {
            navigate(redirectTo || "/");
          }
        }, 2500);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Success Screen
  if (loginSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 flex justify-center"
          >
            <CheckCircle className="w-16 h-16 text-green-500" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome Back!
          </h2>

          <p className="text-gray-600 mb-8 text-lg">
            You have been successfully logged in.
          </p>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="flex justify-center mb-6"
          >
            <Loader className="w-8 h-8 text-blue-600" />
          </motion.div>

          <p className="text-gray-600 text-sm">
            Redirecting to your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-6 flex justify-center"
          >
            <Loader className="w-12 h-12 text-blue-600" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Signing in...
          </h2>

          <p className="text-gray-600">
            Please wait while we verify your credentials.
          </p>

          <div className="mt-6 flex gap-1 justify-center">
            <motion.div
              animate={{ height: [8, 20, 8] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="w-2 bg-blue-600 rounded-full"
            />
            <motion.div
              animate={{ height: [8, 20, 8] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              className="w-2 bg-purple-600 rounded-full"
            />
            <motion.div
              animate={{ height: [8, 20, 8] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              className="w-2 bg-blue-600 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Login Form
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-lg">
            Sign in to your JobPortal account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">
              Email Address
            </label>
            <div
              className={`relative flex items-center border-2 rounded-lg transition-colors ${
                errors.email ? "border-red-500 bg-red-50" : "border-gray-500"
              }`}
            >
              <Mail className="w-5 h-5 text-gray-400 ml-4" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-transparent outline-none placeholder-gray-400 text-gray-800"
              />
            </div>
            {errors.email && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 text-red-600 text-sm"
              >
                <span className="text-red-600">⭕</span>
                <span>{errors.email}</span>
              </motion.div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">
              Password
            </label>
            <div
              className={`relative flex items-center border-2 rounded-lg transition-colors ${
                errors.password ? "border-red-500 bg-red-50" : "border-gray-500"
              }`}
            >
              <Lock className="w-5 h-5 text-gray-400 ml-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-transparent outline-none placeholder-gray-400 text-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mr-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 text-red-600 text-sm"
              >
                <span className="text-red-600">⭕</span>
                <span>{errors.password}</span>
              </motion.div>
            )}
          </div>

          {/* Sign In Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 text-lg mt-8"
          >
            Sign In
          </motion.button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-700">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Create one here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
