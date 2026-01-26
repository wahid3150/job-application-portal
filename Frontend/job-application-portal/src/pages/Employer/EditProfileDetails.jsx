import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Save,
  ArrowLeft,
  Camera,
  User,
  Loader,
} from "lucide-react";
import EmployerLayout from "../../components/Layouts/EmployerLayout";
import { userAPI } from "../../utils/apiService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Memoized InputField component - defined outside to prevent re-creation
const InputField = React.memo(({
  label,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  required = false,
  disabled = false,
  value,
  error,
  onChange,
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div
      className={`relative flex items-center border-2 rounded-xl transition-all ${
        error
          ? "border-red-400 bg-red-50"
          : "border-slate-200 focus-within:border-emerald-500"
      } ${disabled ? "bg-slate-50" : ""}`}
    >
      {Icon && <Icon className="w-5 h-5 text-slate-400 ml-4" />}
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 bg-transparent outline-none placeholder-slate-400 text-slate-800 disabled:cursor-not-allowed"
      />
    </div>
    {error && (
      <p className="text-red-500 text-sm mt-1">{error}</p>
    )}
  </div>
));
InputField.displayName = "InputField";

const EditProfileDetails = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Form data based on User schema fields for employer
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    companyDescription: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getMyProfile();
      if (response.success && response.user) {
        setFormData({
          name: response.user.name || "",
          companyName: response.user.companyName || "",
          companyDescription: response.user.companyDescription || "",
        });
        if (response.user.companyLogo || response.user.avatar) {
          setAvatarPreview(`http://localhost:8000${response.user.companyLogo || response.user.avatar}`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // Use auth context user as fallback
      if (user) {
        setFormData({
          name: user.name || "",
          companyName: user.companyName || "",
          companyDescription: user.companyDescription || "",
        });
        if (user.companyLogo || user.avatar) {
          setAvatarPreview(`http://localhost:8000${user.companyLogo || user.avatar}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload
    try {
      setIsUploadingAvatar(true);
      const response = await userAPI.uploadAvatar(file);
      if (response.success) {
        toast.success("Logo updated successfully");
        // Update auth context
        const token = localStorage.getItem("token");
        if (token && response.user) {
          login(response.user, token);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload logo");
      const fallbackAvatar = user?.companyLogo || user?.avatar;
      setAvatarPreview(fallbackAvatar ? `http://localhost:8000${fallbackAvatar}` : null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSaving(true);
    try {
      const response = await userAPI.updateProfile(formData);
      if (response.success) {
        toast.success("Profile updated successfully");
        // Update auth context
        const token = localStorage.getItem("token");
        if (token && response.user) {
          login(response.user, token);
        }
        navigate("/company-profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
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

  return (
    <EmployerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Edit Profile</h1>
          <p className="text-slate-500 mt-2">
            Update your company information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section - uploads to avatar field in User schema */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-500" />
              Company Logo
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Logo"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <Loader className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  Change Logo
                </button>
                <p className="text-sm text-slate-500 mt-2">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information - Based on User schema */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-500" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                name="name"
                placeholder="Your name"
                icon={User}
                required
                value={formData.name}
                error={errors.name}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative flex items-center border-2 rounded-xl border-slate-200 bg-slate-50">
                  <Mail className="w-5 h-5 text-slate-400 ml-4" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-3 bg-transparent outline-none text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Company Information - Based on User schema */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              Company Information
            </h2>
            <div className="space-y-6">
              <InputField
                label="Company Name"
                name="companyName"
                placeholder="Your company name"
                icon={Building2}
                required
                value={formData.companyName}
                error={errors.companyName}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Description
                </label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell candidates about your company, culture, and what makes it a great place to work..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </EmployerLayout>
  );
};

export default EditProfileDetails;
