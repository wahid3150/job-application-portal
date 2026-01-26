import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  ChevronRight,
  Eye,
  Save,
  ArrowLeft,
  Loader,
  X,
} from "lucide-react";
import EmployerLayout from "../../components/Layouts/EmployerLayout";
import { jobAPI } from "../../utils/apiService";
import toast from "react-hot-toast";

// Memoized InputField component - defined outside to prevent re-creation
const InputField = React.memo(({
  label,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  required = false,
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
      }`}
    >
      {Icon && <Icon className="w-5 h-5 text-slate-400 ml-4" />}
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-transparent outline-none placeholder-slate-400 text-slate-800"
      />
    </div>
    {error && (
      <p className="text-red-500 text-sm mt-1">{error}</p>
    )}
  </div>
));
InputField.displayName = "InputField";

// Memoized SelectField component - defined outside to prevent re-creation
const SelectField = React.memo(({ label, name, options, icon: Icon, required = false, value, error, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className={`relative flex items-center border-2 rounded-xl transition-all ${
      error
        ? "border-red-400 bg-red-50"
        : "border-slate-200 focus-within:border-emerald-500"
    }`}>
      {Icon && <Icon className="w-5 h-5 text-slate-400 ml-4" />}
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full px-4 py-3 bg-transparent outline-none text-slate-800 appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronRight className="w-5 h-5 text-slate-400 mr-4 rotate-90" />
    </div>
    {error && (
      <p className="text-red-500 text-sm mt-1">{error}</p>
    )}
  </div>
));
SelectField.displayName = "SelectField";

const JobPostingForm = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEditMode = Boolean(jobId);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    jobType: "full-time",
    salaryMin: "",
    salaryMax: "",
  });
  const [errors, setErrors] = useState({});

  const jobTypes = [
    { value: "full-time", label: "Full Time" },
    { value: "part-time", label: "Part Time" },
    { value: "remote", label: "Remote" },
    { value: "internship", label: "Internship" },
    { value: "contract", label: "Contract" },
  ];

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

  useEffect(() => {
    const loadJobForEdit = async () => {
      if (!isEditMode) return;
      try {
        setIsLoadingJob(true);

        const toForm = (j) => ({
          title: j.title || "",
          description: j.description || "",
          requirements: j.requirements || "",
          location: j.location || "",
          jobType: j.jobType || "full-time",
          salaryMin: typeof j.salaryMin === "number" ? String(j.salaryMin) : "",
          salaryMax: typeof j.salaryMax === "number" ? String(j.salaryMax) : "",
        });

        const jobRes = await jobAPI.getJobById(jobId).catch(() => ({}));
        if (jobRes.success && jobRes.job) {
          setFormData(toForm(jobRes.job));
          return;
        }

        const employerJobsRes = await jobAPI.getEmployerJobs().catch(() => ({}));
        const found = (employerJobsRes.jobs || []).find((j) => j._id === jobId);
        if (found) {
          setFormData(toForm(found));
          return;
        }

        toast.error("Unable to load job for editing");
        navigate("/manage-jobs");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load job");
        navigate("/manage-jobs");
      } finally {
        setIsLoadingJob(false);
      }
    };

    loadJobForEdit();
  }, [isEditMode, jobId, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.description.trim())
      newErrors.description = "Job description is required";
    if (!formData.requirements.trim())
      newErrors.requirements = "Requirements are required";
    if (!formData.jobType) newErrors.jobType = "Job type is required";

    // Validate salary
    if (formData.salaryMin && formData.salaryMax) {
      if (Number(formData.salaryMax) < Number(formData.salaryMin)) {
        newErrors.salaryMax = "Max salary must be greater than min salary";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        jobType: formData.jobType,
        // Allow clearing salary fields on edit by sending null
        salaryMin:
          formData.salaryMin === ""
            ? null
            : Number(formData.salaryMin),
        salaryMax:
          formData.salaryMax === ""
            ? null
            : Number(formData.salaryMax),
      };

      const response = isEditMode
        ? await jobAPI.updateJob(jobId, jobData)
        : await jobAPI.createJob(jobData);

      if (response.success) {
        toast.success(isEditMode ? "Job updated successfully!" : "Job posted successfully!");
        navigate("/manage-jobs");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (isEditMode ? "Failed to update job" : "Failed to create job"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  // Job Preview Component
  const JobPreview = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => setShowPreview(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Preview Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Job Preview</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6 space-y-6">
          {/* Title & Meta */}
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {formData.title || "Job Title"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              {formData.location && (
                <span className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {formData.location}
                </span>
              )}
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                {jobTypes.find((t) => t.value === formData.jobType)?.label}
              </span>
              {(formData.salaryMin || formData.salaryMax) && (
                <span className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="w-4 h-4" />
                  {formData.salaryMin && formData.salaryMax
                    ? `$${formData.salaryMin} - $${formData.salaryMax}`
                    : formData.salaryMin
                    ? `From $${formData.salaryMin}`
                    : `Up to $${formData.salaryMax}`}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Job Description
            </h3>
            <p className="text-slate-600 whitespace-pre-line">
              {formData.description || "No description provided"}
            </p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Requirements
            </h3>
            <p className="text-slate-600 whitespace-pre-line">
              {formData.requirements || "No requirements provided"}
            </p>
          </div>
        </div>

        {/* Preview Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-end gap-3">
          <button
            onClick={() => setShowPreview(false)}
            className="px-6 py-2.5 border-2 border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              (isEditMode ? "Update Job" : "Publish Job")
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <EmployerLayout>
      <AnimatePresence>{showPreview && <JobPreview />}</AnimatePresence>

      {isLoadingJob ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader className="w-12 h-12 text-emerald-500" />
          </motion.div>
        </div>
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
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
          <h1 className="text-3xl font-bold text-slate-800">
            {isEditMode ? "Edit Job Posting" : "Create New Job Posting"}
          </h1>
          <p className="text-slate-500 mt-2">
            {isEditMode
              ? "Update the details below to edit your job listing"
              : "Fill in the details below to create a new job listing"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" />
              Job Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField
                  label="Job Title"
                  name="title"
                  placeholder="e.g. Senior Frontend Developer"
                  icon={Briefcase}
                  required
                  value={formData.title}
                  error={errors.title}
                  onChange={handleChange}
                />
              </div>
              <InputField
                label="Location"
                name="location"
                placeholder="e.g. New York, NY"
                icon={MapPin}
                value={formData.location}
                error={errors.location}
                onChange={handleChange}
              />
              <SelectField
                label="Job Type"
                name="jobType"
                options={jobTypes}
                icon={Briefcase}
                required
                value={formData.jobType}
                error={errors.jobType}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Salary Range
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Minimum Salary"
                name="salaryMin"
                type="number"
                placeholder="e.g. 50000"
                icon={DollarSign}
                value={formData.salaryMin}
                error={errors.salaryMin}
                onChange={handleChange}
              />
              <InputField
                label="Maximum Salary"
                name="salaryMax"
                type="number"
                placeholder="e.g. 80000"
                icon={DollarSign}
                value={formData.salaryMax}
                error={errors.salaryMax}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              Job Details
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                  className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all resize-none ${
                    errors.description
                      ? "border-red-400 bg-red-50"
                      : "border-slate-200 focus:border-emerald-500"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  placeholder="List the skills, qualifications, and experience required for this role..."
                  className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all resize-none ${
                    errors.requirements
                      ? "border-red-400 bg-red-50"
                      : "border-slate-200 focus:border-emerald-500"
                  }`}
                />
                {errors.requirements && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.requirements}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-5 h-5" />
              Preview Job
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditMode ? "Update Job" : "Publish Job"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
      )}
    </EmployerLayout>
  );
};

export default JobPostingForm;
