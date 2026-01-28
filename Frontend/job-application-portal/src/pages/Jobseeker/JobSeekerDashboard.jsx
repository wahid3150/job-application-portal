import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Search,
  Filter,
  Loader,
  Heart,
  ClipboardList,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building2,
  CheckCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { jobAPI, savedJobAPI, applicationAPI } from "../../utils/apiService";
import JobseekerLayout from "../../components/Layouts/JobseekerLayout";
import { useAuth } from "../../context/AuthContext";

// Public Layout for unauthenticated users
const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-white">
    {/* Public Navbar */}
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">JobPortal</span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>

    {/* Main Content */}
    <main className="pt-16 min-h-screen">
      <div className="p-4 lg:p-8">{children}</div>
    </main>
  </div>
);

// Memoized Filter Section Component
const FilterSection = memo(({ title, isExpanded, onToggle, children }) => (
  <div className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between mb-3"
    >
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {isExpanded ? (
        <ChevronUp className="w-4 h-4 text-gray-500" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-500" />
      )}
    </button>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));
FilterSection.displayName = "FilterSection";

// Memoized Salary Input Component
const SalaryInput = memo(({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm text-gray-600 mb-1">{label}</label>
    <input
      type="number"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
    />
  </div>
));
SalaryInput.displayName = "SalaryInput";

// Memoized Checkbox Component
const FilterCheckbox = memo(({ value, checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
    />
    <span className="text-sm text-gray-700 group-hover:text-gray-900">
      {label}
    </span>
  </label>
));
FilterCheckbox.displayName = "FilterCheckbox";

const JobSeekerDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandedFilters, setExpandedFilters] = useState({
    jobType: true,
    salary: true,
    category: true,
  });

  const jobTypes = useMemo(
    () => [
      { value: "remote", label: "Remote" },
      { value: "full-time", label: "Full Time" },
      { value: "part-time", label: "Part Time" },
      { value: "contract", label: "Contract" },
      { value: "internship", label: "Internship" },
    ],
    [],
  );

  // Comprehensive job categories based on common industry standards
  const categories = useMemo(
    () => [
      {
        value: "engineering",
        label: "Engineering",
        keywords: [
          "engineer",
          "engineering",
          "developer",
          "programmer",
          "software",
          "tech",
          "coding",
          "programming",
          "full stack",
          "backend",
          "frontend",
          "devops",
          "system",
          "network",
          "database",
          "api",
          "javascript",
          "python",
          "java",
          "react",
          "node",
        ],
      },
      {
        value: "design",
        label: "Design",
        keywords: [
          "design",
          "designer",
          "ui",
          "ux",
          "graphic",
          "creative",
          "visual",
          "illustration",
          "figma",
          "adobe",
          "photoshop",
          "sketch",
          "prototype",
          "wireframe",
        ],
      },
      {
        value: "marketing",
        label: "Marketing",
        keywords: [
          "marketing",
          "marketer",
          "advertising",
          "promotion",
          "brand",
          "digital marketing",
          "seo",
          "sem",
          "content marketing",
          "social media",
          "campaign",
          "analytics",
          "growth",
        ],
      },
      {
        value: "sales",
        label: "Sales",
        keywords: [
          "sales",
          "seller",
          "account",
          "business development",
          "b2b",
          "b2c",
          "account executive",
          "account manager",
          "sales manager",
          "revenue",
          "client",
          "customer",
        ],
      },
      {
        value: "product",
        label: "Product",
        keywords: [
          "product manager",
          "product owner",
          "product",
          "pm",
          "roadmap",
          "strategy",
          "agile",
          "scrum",
        ],
      },
      {
        value: "operations",
        label: "Operations",
        keywords: [
          "operations",
          "operations manager",
          "ops",
          "process",
          "efficiency",
          "logistics",
          "supply chain",
        ],
      },
      {
        value: "finance",
        label: "Finance",
        keywords: [
          "finance",
          "financial",
          "accountant",
          "accounting",
          "cfo",
          "analyst",
          "audit",
          "bookkeeping",
        ],
      },
      {
        value: "hr",
        label: "Human Resources",
        keywords: [
          "hr",
          "human resources",
          "recruiter",
          "recruitment",
          "talent",
          "people",
          "hiring",
        ],
      },
    ],
    [],
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Build keyword search including category keywords
      let searchKeyword = keyword;
      if (selectedCategories.length > 0) {
        const categoryKeywords = selectedCategories
          .map((cat) => categories.find((c) => c.value === cat)?.keywords || [])
          .flat()
          .join("|");
        searchKeyword = searchKeyword
          ? `${searchKeyword}|${categoryKeywords}`
          : categoryKeywords;
      }

      const [jobsRes, appsRes] = await Promise.all([
        jobAPI.getAllJobs({
          keyword: searchKeyword || undefined,
          location: location || undefined,
          jobType: selectedJobTypes.length > 0 ? selectedJobTypes.join(",") : undefined,
          salaryMin: salaryMin || undefined,
          salaryMax: salaryMax || undefined,
          page: 1,
          limit: 50,
        }),
        applicationAPI.getMyApplications().catch(() => ({ success: false, applications: [] })),
      ]);

      // Filter by category if multiple categories selected
      let filteredJobs = jobsRes.success ? jobsRes.jobs || [] : [];
      if (selectedCategories.length > 0 && filteredJobs.length > 0) {
        filteredJobs = filteredJobs.filter((job) => {
          const jobText = `${job.title} ${job.description || ""} ${job.requirements || ""}`.toLowerCase();
          return selectedCategories.some((cat) => {
            const category = categories.find((c) => c.value === cat);
            return category?.keywords.some((keyword) => jobText.includes(keyword.toLowerCase()));
          });
        });
      }

      if (jobsRes.success) {
        setJobs(filteredJobs);
      } else {
        toast.error(jobsRes.message || "Failed to load jobs");
      }

      if (appsRes.success) {
        setApplications(appsRes.applications || []);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  }, [keyword, location, selectedJobTypes, selectedCategories, salaryMin, salaryMax, categories, isAuthenticated]);

  // Redirect employers to their dashboard if they try to access jobseeker pages
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "employer") {
      navigate("/employer-dashboard", { replace: true });
    }
  }, [authLoading, isAuthenticated, user?.role, navigate]);

  useEffect(() => {
    // Only fetch data if user is not an employer (or not authenticated)
    if (!authLoading && (!isAuthenticated || user?.role !== "employer")) {
      fetchData();
    }
  }, [fetchData, authLoading, isAuthenticated, user?.role]);

  const handleApplyFilters = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleClearFilters = useCallback(() => {
    setKeyword("");
    setLocation("");
    setSalaryMin("");
    setSalaryMax("");
    setSelectedJobTypes([]);
    setSelectedCategories([]);
  }, []);

  const toggleCategory = useCallback((category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }, []);

  const toggleJobType = useCallback((type) => {
    setSelectedJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleSalaryMinChange = useCallback((e) => {
    setSalaryMin(e.target.value);
  }, []);

  const handleSalaryMaxChange = useCallback((e) => {
    setSalaryMax(e.target.value);
  }, []);

  const toggleFilterSection = useCallback((section) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const formatSalary = (min, max) => {
    if (typeof min === "number" && typeof max === "number") {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    if (typeof min === "number") return `From $${min.toLocaleString()}`;
    if (typeof max === "number") return `Up to $${max.toLocaleString()}`;
    return "Not specified";
  };

  const formatSalaryShort = (min, max) => {
    if (typeof min === "number" && typeof max === "number") {
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    }
    if (typeof min === "number") return `$${(min / 1000).toFixed(0)}k+`;
    if (typeof max === "number") return `Up to $${(max / 1000).toFixed(0)}k`;
    return "Not specified";
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      const suffix = day === 1 || day === 21 || day === 31 ? "st" : day === 2 || day === 22 ? "nd" : day === 3 || day === 23 ? "rd" : "th";
      return `${day}${suffix} ${month} ${year}`;
    } catch {
      return "";
    }
  };

  const getJobApplicationStatus = useCallback(
    (jobId) => {
      const application = applications.find((app) => app.job?._id === jobId);
      return application?.status || null;
    },
    [applications]
  );

  const onSave = useCallback(async (jobId, e) => {
    e?.stopPropagation();
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const res = await savedJobAPI.saveJob(jobId);
      if (res.success) {
        toast.success("Job saved");
        fetchData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save job");
    }
  }, [fetchData, isAuthenticated, navigate]);

  const onApply = useCallback(async (jobId, e) => {
    e?.stopPropagation();
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const res = await applicationAPI.applyForJob(jobId);
      if (res.success) {
        toast.success("Applied successfully");
        fetchData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to apply");
    }
  }, [fetchData, isAuthenticated, navigate]);

  const getStatusButton = useCallback(
    (job) => {
      // If not authenticated, show "Login to Apply" button
      if (!isAuthenticated) {
        return (
          <button
            onClick={(e) => {
              e?.stopPropagation();
              navigate("/login");
            }}
            className="px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Login to Apply
          </button>
        );
      }

      const status = getJobApplicationStatus(job._id);
      if (status === "accepted") {
        return (
          <button
            disabled
            className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200"
          >
            Accepted
          </button>
        );
      }
      if (status === "rejected") {
        return (
          <button
            disabled
            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200"
          >
            Rejected
          </button>
        );
      }
      if (status) {
        return (
          <button
            disabled
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium border border-gray-200"
          >
            Applied
          </button>
        );
      }
      return (
        <button
          onClick={(e) => onApply(job._id, e)}
          className="px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Apply Now
        </button>
      );
    },
    [getJobApplicationStatus, onApply, isAuthenticated, navigate]
  );

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Don't render if user is an employer (will be redirected)
  if (isAuthenticated && user?.role === "employer") {
    return null;
  }

  // Use appropriate layout based on authentication
  const Layout = isAuthenticated ? JobseekerLayout : PublicLayout;

  return (
    <Layout>
      <div className="relative">
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-0">
          {/* Top Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Job title, company, or keyword"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                  />
                </div>
                <button
                  onClick={handleApplyFilters}
                  className="px-8 py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Search Jobs
                </button>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Sidebar - Filters: sticky with scrollable content */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:max-h-[calc(100vh-7rem)] lg:flex lg:flex-col lg:overflow-hidden">
                <div className="p-6 pb-2 flex items-center justify-between shrink-0">
                  <h2 className="text-lg font-bold text-gray-900">Filter Jobs</h2>
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="px-6 pb-6 overflow-y-auto overscroll-contain min-h-0 lg:flex-1 scrollbar-hide">
                {/* Job Type Filter */}
                <FilterSection
                  title="Job Type"
                  isExpanded={expandedFilters.jobType}
                  onToggle={() => toggleFilterSection("jobType")}
                >
                  <div className="space-y-2">
                    {jobTypes.map((type) => (
                      <FilterCheckbox
                        key={type.value}
                        value={type.value}
                        checked={selectedJobTypes.includes(type.value)}
                        onChange={() => toggleJobType(type.value)}
                        label={type.label}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* Salary Range Filter */}
                <FilterSection
                  title="Salary Range"
                  isExpanded={expandedFilters.salary}
                  onToggle={() => toggleFilterSection("salary")}
                >
                  <div className="space-y-3">
                    <SalaryInput
                      label="Min Salary"
                      value={salaryMin}
                      onChange={handleSalaryMinChange}
                      placeholder="0"
                    />
                    <SalaryInput
                      label="Max Salary"
                      value={salaryMax}
                      onChange={handleSalaryMaxChange}
                      placeholder="No limit"
                    />
                  </div>
                </FilterSection>

                {/* Category Filter */}
                <FilterSection
                  title="Category"
                  isExpanded={expandedFilters.category}
                  onToggle={() => toggleFilterSection("category")}
                >
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <FilterCheckbox
                        key={category.value}
                        value={category.value}
                        checked={selectedCategories.includes(category.value)}
                        onChange={() => toggleCategory(category.value)}
                        label={category.label}
                      />
                    ))}
                  </div>
                </FilterSection>
                </div>
              </div>
            </motion.aside>

            {/* Main Content - Job Listings */}
            <div className="flex-1 min-w-0">
              {/* Header with count and view toggle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between mb-4"
              >
                <p className="text-gray-600 font-medium">
                  Showing <span className="text-gray-900 font-semibold">{jobs.length}</span> jobs
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    to="/my-applications"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <ClipboardList className="w-4 h-4" />
                    My Applications
                  </Link>
                  <Link
                    to="/saved-jobs"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    Saved Jobs
                  </Link>
                </div>
              </motion.div>

              {isLoading ? (
                <div className="flex items-center justify-center min-h-[50vh]">
                  <Loader className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-50/30 to-purple-50/30"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-linear-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-600">Try adjusting your filters.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job, index) => {
                    const applicationStatus = getJobApplicationStatus(job._id);
                    const companyName = job.company?.companyName || job.company?.name || "Company";
                    const companyInitial = companyName.charAt(0).toUpperCase();
                    const companyLogo = job.company?.companyLogo || job.company?.avatar;

                    return (
                      <motion.div
                        key={job._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-300 relative overflow-hidden group cursor-pointer"
                        onClick={() => window.location.href = `/job/${job._id}`}
                      >
                        {/* Gradient accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-100 to-purple-100 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>

                        <div className="relative z-10">
                          {/* Header with logo and bookmark */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {companyLogo ? (
                                <img
                                  src={`http://localhost:8000${companyLogo}`}
                                  alt={companyName}
                                  className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                  {companyInitial}
                                </div>
                              )}
                              <div className="min-w-0">
                                <Link
                                  to={`/job/${job._id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors block truncate"
                                >
                                  {job.title}
                                </Link>
                                <p className="text-sm text-gray-600 truncate mt-0.5">
                                  {companyName}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => onSave(job._id, e)}
                              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                              title="Save Job"
                            >
                              <Heart className="w-5 h-5 text-gray-400 hover:text-rose-500 transition-colors" />
                            </button>
                          </div>

                          {/* Job Details */}
                          <div className="space-y-3 mb-4">
                            {job.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{job.location}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>Posted {formatDate(job.createdAt)}</span>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-200">
                                {jobTypes.find((t) => t.value === job.jobType)?.label || job.jobType}
                              </span>
                            </div>
                          </div>

                          {/* Footer with salary and action */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div>
                              <p className="text-lg font-bold text-gray-900">
                                {formatSalaryShort(job.salaryMin, job.salaryMax)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatSalary(job.salaryMin, job.salaryMax)}
                              </p>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              {getStatusButton(job)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobSeekerDashboard;
