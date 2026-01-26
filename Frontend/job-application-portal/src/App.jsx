import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage/LandingPage";
import SignUp from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import JobSeekerDashboard from "./pages/Jobseeker/JobSeekerDashboard";
import JobDetails from "./pages/Jobseeker/JobDetails";
import SavedJobs from "./pages/Jobseeker/SavedJobs";
import UserProfile from "./pages/Jobseeker/UserProfile";
import MyApplications from "./pages/Jobseeker/MyApplications";
import EmployerDashboard from "./pages/Employer/EmployerDashboard";
import JobPostingForm from "./pages/Employer/JobPostingForm";
import ManageJobs from "./pages/Employer/ManageJobs";
import ApplicationViewer from "./pages/Employer/ApplicationViewer";
import EmployerProfilePage from "./pages/Employer/EmployerProfilePage";
import EditProfileDetails from "./pages/Employer/EditProfileDetails";
import EmployerJobDetails from "./pages/Employer/EmployerJobDetails";
import ProtectedRoute from "./pages/routes/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <div>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            {/* Public job listing - redirects authenticated users to their dashboard */}
            <Route path="/find-jobs" element={<JobSeekerDashboard />} />
            <Route path="/job/:jobId" element={<JobDetails />} />
            {/* Protected Jobseeker Routes */}
            <Route element={<ProtectedRoute requiredRole="jobseeker" />}>
              <Route path="/jobseeker-dashboard" element={<JobSeekerDashboard />} />
              <Route path="/saved-jobs" element={<SavedJobs />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>
            {/* Protected Employer Routes */}
            <Route element={<ProtectedRoute requiredRole="employer" />}>
              <Route
                path="/employer-dashboard"
                element={<EmployerDashboard />}
              />
              <Route path="/post-job" element={<JobPostingForm />} />
              <Route path="/edit-job/:jobId" element={<JobPostingForm />} />
              <Route path="/employer/job/:jobId" element={<EmployerJobDetails />} />
              <Route path="/manage-jobs" element={<ManageJobs />} />
              <Route path="/applications" element={<ApplicationViewer />} />
              <Route
                path="/company-profile"
                element={<EmployerProfilePage />}
              />
              <Route path="/edit-profile" element={<EditProfileDetails />} />
            </Route>
            {/* Catch all Routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster
          toastOptions={{
            className: "",
            style: {
              fontSize: "13px",
            },
          }}
        />
      </div>
    </AuthProvider>
  );
};

export default App;
