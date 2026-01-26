# 🚀 API INTEGRATION IMPLEMENTATION GUIDE

## Overview
This document explains how the entire backend API ecosystem has been integrated into the frontend with a clear architectural approach and storytelling of how it all works together.

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [API Structure Breakdown](#api-structure-breakdown)
3. [Integration Files Created](#integration-files-created)
4. [How It Works: User Journey](#how-it-works-user-journey)
5. [API Usage Examples](#api-usage-examples)

---

## 🏗️ Architecture Overview

### The Integration Stack

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
│              (Pages, Components, Hooks)                  │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│          AuthContext (Global State)                      │
│  - Manages user authentication state                     │
│  - Provides login/logout methods                         │
│  - Maintains JWT token lifecycle                         │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│         API Service Layer (apiService.js)               │
│  - authAPI, jobAPI, applicationAPI, etc.               │
│  - Organized by feature/domain                          │
│  - Error handling and response formatting               │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│      Axios Instance (axiosInstance.js)                   │
│  - Token injection in request headers                    │
│  - 401 error handling (expired token)                    │
│  - Consistent error responses                           │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│      API Endpoints Config (apiPaths.js)                  │
│  - Centralized endpoint definitions                      │
│  - Dynamic URL generation with parameters                │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│         Backend Express APIs (localhost:5000)            │
│  - All route handlers                                    │
│  - Database operations                                   │
│  - Authentication middleware                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 API Structure Breakdown

### 1. **Authentication API** (`POST /auth/*`)
Handles user registration, login, and profile verification.

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/register` | POST | ❌ | Create new user account |
| `/auth/login` | POST | ❌ | User login & token generation |
| `/auth/me` | GET | ✅ | Get current user profile |

**Story**: When a new user signs up, they provide their credentials and role (Job Seeker or Employer). The API creates their account and stores it in MongoDB. When they log in, they receive a JWT token that acts like a digital ID badge—every subsequent request includes this token to prove they are who they claim to be.

---

### 2. **Job API** (`GET/POST /jobs/*`)
Manages job postings for employers and job listings for seekers.

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/jobs` | GET | ❌ | All | View all job listings |
| `/jobs/:id` | GET | ❌ | All | View specific job details |
| `/jobs` | POST | ✅ | Employer | Post a new job |
| `/jobs/employer/me` | GET | ✅ | Employer | View my posted jobs |
| `/jobs/:id` | PUT | ✅ | Employer | Update job details |
| `/jobs/:id` | DELETE | ✅ | Employer | Delete job posting |
| `/jobs/:id/toggle` | PATCH | ✅ | Employer | Activate/deactivate job |

**Story**: Employers browse the system, click "Post a Job," fill in details (title, description, requirements), and submit. The API stores it in the database and makes it visible to all job seekers. Job seekers can then browse, filter, and view these postings in real-time.

---

### 3. **Application API** (`POST/GET /applications/*`)
Manages job applications submitted by job seekers.

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/applications/:jobId` | POST | ✅ | Job Seeker | Apply for a job |
| `/applications/me` | GET | ✅ | Job Seeker | View my applications |
| `/applications/job/:jobId` | GET | ✅ | Employer | View applications for a job |
| `/applications/:id/status` | PATCH | ✅ | Employer | Update application status (accept/reject) |

**Story**: A job seeker finds an interesting job and clicks "Apply." This sends the application to the backend. The employer can then see all applications for their job and accept or reject candidates. The job seeker receives notifications about their application status.

---

### 4. **Saved Jobs API** (`POST/GET /saved-jobs/*`)
Allows job seekers to bookmark favorite jobs.

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/saved-jobs/:jobId` | POST | ✅ | Job Seeker | Save a job to favorites |
| `/saved-jobs` | GET | ✅ | Job Seeker | View all saved jobs |
| `/saved-jobs/:jobId` | DELETE | ✅ | Job Seeker | Remove from saved |

**Story**: A job seeker sees a great job but isn't ready to apply yet. They click the bookmark icon to save it. Later, they can visit their "Saved Jobs" section to see all bookmarked positions and apply when they're ready.

---

### 5. **User Profile API** (`GET/PUT /users/*`)
Manages user profiles, avatars, and resumes.

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/users/me` | GET | ✅ | All | Get my profile |
| `/users/me` | PUT | ✅ | All | Update my profile |
| `/users/me/avatar` | PUT | ✅ | All | Upload profile picture |
| `/users/me/resume` | PUT | ✅ | Job Seeker | Upload resume |
| `/users/me/resume` | DELETE | ✅ | Job Seeker | Delete resume |
| `/users/:id` | GET | ❌ | All | View public profile |

**Story**: Users can customize their profiles with a profile picture and bio. Job seekers can upload their resume here. When employers look at an application, they can click to view the applicant's public profile and download their resume.

---

### 6. **Analytics API** (`GET /analytics/*`)
Provides insights for employers.

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/analytics/me` | GET | ✅ | Employer | Get job posting analytics |

**Story**: Employers have an Analytics Dashboard showing how many people viewed their job postings, how many applied, and which jobs are getting the most interest. This helps them understand market demand.

---

## 📁 Integration Files Created

### 1. **`src/utils/apiPaths.js`** - Endpoint Configuration
```javascript
// Centralizes all API endpoint definitions
// Uses functions for dynamic endpoints with parameters
// Example:
//   JOB_ENDPOINTS.GET_JOB_BY_ID(123) → "http://localhost:5000/api/jobs/123"
```

**Why**: Single source of truth for all API routes. If backend endpoints change, update one file instead of searching everywhere.

---

### 2. **`src/utils/axiosInstance.js`** - HTTP Client
```javascript
// Custom Axios configuration with automatic token handling
// Features:
//   - Request interceptor: adds JWT token to headers
//   - Response interceptor: handles 401 errors (token expired)
//   - Automatic redirect to login on expired session
```

**Why**: Every API request needs authentication. Instead of manually adding tokens everywhere, the interceptor handles it automatically.

---

### 3. **`src/utils/apiService.js`** - API Functions
```javascript
// Organized API functions by feature:
//   - authAPI.login(), authAPI.register(), authAPI.getProfile()
//   - jobAPI.getAllJobs(), jobAPI.createJob(), jobAPI.deleteJob()
//   - applicationAPI.applyForJob(), applicationAPI.getMyApplications()
//   - savedJobAPI.saveJob(), savedJobAPI.getSavedJobs()
//   - userAPI.updateProfile(), userAPI.uploadAvatar(), userAPI.uploadResume()
//   - analyticsAPI.getMyAnalytics()
```

**Why**: Clean, organized API interface. Components import only what they need. Easy to test and maintain.

---

### 4. **`src/context/AuthContext.jsx`** - Global Auth State
```javascript
// React Context for managing authentication globally
// Provides:
//   - useAuth() hook to access auth state in any component
//   - login(userData, token) method
//   - logout() method
//   - isAuthenticated flag
//   - Token verification on app load
```

**Why**: Avoids "prop drilling" (passing props through many components). Auth state is available everywhere without messy prop passing.

---

### 5. **Updated `src/App.jsx`** - AuthProvider Wrapper
```javascript
// Wrapped entire app with <AuthProvider>
// Makes auth context available to all routes and components
```

---

### 6. **Updated `src/pages/Auth/Login.jsx`** - Real API Integration
```javascript
// Before: Used fake 2-second delay
// After: Calls authAPI.login() with real backend
// On success: Stores token, updates context, redirects by role
```

---

### 7. **Updated `src/pages/Auth/Signup.jsx`** - Real API Integration
```javascript
// Before: Used fake 2-second delay
// After: Calls authAPI.register() with FormData (handles file upload)
// Creates account with: name, email, password, role, avatar, company details
```

---

### 8. **Updated `src/pages/routes/ProtectedRoute.jsx`** - Route Protection
```javascript
// Before: Rendered everything without checking auth
// After: 
//   - Checks if user is authenticated
//   - Checks if user has required role (employer/jobseeker)
//   - Redirects to login if not authorized
//   - Shows loading spinner while checking
```

---

## 📖 How It Works: User Journey

### **Scenario 1: Job Seeker's Journey**

```
1. USER VISITS HOMEPAGE
   └─ No token in localStorage
   └─ Anonymous routes available (/, /login, /signup, /find-jobs)

2. USER SIGNS UP
   └─ Fills form: name, email, password, role="jobseeker", avatar
   └─ Signup.jsx calls authAPI.register(userData)
   └─ axiosInstance POSTs to /auth/register
   └─ Backend creates user, hashes password, returns success
   └─ Toast shows "Account created! Please login"
   └─ Redirects to /login page

3. USER LOGS IN
   └─ Fills form: email, password
   └─ Login.jsx calls authAPI.login(email, password)
   └─ axiosInstance POSTs to /auth/login
   └─ Backend verifies credentials, generates JWT token
   └─ Returns: { success: true, token: "xyz...", user: {...} }
   └─ Login.jsx stores token in localStorage
   └─ AuthContext's login() method updates global state
   └─ Shows success animation
   └─ Redirects to /find-jobs (JobSeekerDashboard)

4. USER BROWSES JOBS
   └─ JobSeekerDashboard.jsx calls jobAPI.getAllJobs()
   └─ axiosInstance intercepts request, adds token header
   └─ Backend authenticates token, returns all jobs
   └─ Jobs display with "Apply" and "Save" buttons

5. USER SAVES A JOB
   └─ User clicks bookmark icon
   └─ SavedJobs.jsx calls savedJobAPI.saveJob(jobId)
   └─ Backend stores relationship in database
   └─ Toast shows "Job saved!"

6. USER APPLIES FOR JOB
   └─ User clicks "Apply" button
   └─ applicationAPI.applyForJob(jobId)
   └─ Backend creates application record
   └─ Toast shows "Application submitted!"

7. USER VIEWS APPLICATIONS
   └─ Clicks "My Applications" tab
   └─ applicationAPI.getMyApplications()
   └─ Backend returns all user's applications with statuses
   └─ Shows: applied, under review, accepted, rejected

8. USER UPDATES PROFILE
   └─ Goes to /profile (UserProfile.jsx)
   └─ Calls userAPI.updateProfile(data)
   └─ Can upload avatar via userAPI.uploadAvatar(file)
   └─ Can upload resume via userAPI.uploadResume(file)
   └─ Backend stores files and updates user record

9. SESSION EXPIRES (Token expires after 7 days)
   └─ User makes API request with expired token
   └─ Backend returns 401 Unauthorized
   └─ axiosInstance response interceptor catches 401
   └─ Clears localStorage
   └─ Redirects to /login automatically
   └─ User must log in again
```

---

### **Scenario 2: Employer's Journey**

```
1. EMPLOYER SIGNS UP
   └─ Role = "employer"
   └─ Provides: name, email, password, avatar
   └─ Optional: companyName, companyDescription
   └─ Same signup flow as job seeker

2. EMPLOYER LOGS IN
   └─ Same login flow
   └─ AuthContext detects role = "employer"
   └─ Redirects to /employer-dashboard (not /find-jobs)

3. EMPLOYER POSTS JOB
   └─ Clicks "Post a Job"
   └─ Fills JobPostingForm with:
      - Job title, description, requirements
      - Salary, location, job type
   └─ Clicks "Post Job"
   └─ jobAPI.createJob(jobData)
   └─ Backend creates job record, returns job ID
   └─ Toast shows "Job posted successfully!"
   └─ Redirects to /manage-jobs

4. EMPLOYER MANAGES JOBS
   └─ Views all posted jobs
   └─ jobAPI.getEmployerJobs()
   └─ Shows: active jobs, applications count, views
   └─ Can edit, delete, or toggle job status
   └─ jobAPI.updateJob(jobId, data)
   └─ jobAPI.deleteJob(jobId)
   └─ jobAPI.toggleJobStatus(jobId)

5. EMPLOYER REVIEWS APPLICATIONS
   └─ For each job, clicks "View Applications"
   └─ applicationAPI.getJobApplications(jobId)
   └─ Shows all applicants with their profiles
   └─ Can click applicant to see profile and download resume
   └─ Can accept/reject application
   └─ applicationAPI.updateApplicationStatus(appId, status)

6. EMPLOYER VIEWS ANALYTICS
   └─ Goes to EmployerDashboard
   └─ analyticsAPI.getMyAnalytics()
   └─ Shows: total jobs posted, total applications, views per job
   └─ Visualized with charts and metrics

7. EMPLOYER UPDATES PROFILE
   └─ Goes to /company-profile
   └─ Updates company name, description, logo
   └─ userAPI.updateProfile(data)
   └─ userAPI.uploadAvatar(file) for company logo
```

---

## 🔄 Token Flow Diagram

```
┌─────────────────┐
│   User Login    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend verifies email &   │
│  password, generates JWT    │
│  token (7-day expiry)       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Frontend stores token in   │
│  localStorage               │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  For every API request:     │
│  - axiosInstance adds       │
│    "Authorization: Bearer   │
│     [token]" header         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend middleware checks  │
│  token validity             │
│  - Valid? Continue          │
│  - Invalid? Return 401      │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
  401?     Valid?
    │          │
    ▼          ▼
┌────────┐  ┌──────────┐
│Clear   │  │Process   │
│token & │  │request & │
│Redirect│  │respond   │
│to login│  │with data │
└────────┘  └──────────┘
```

---

## 💻 API Usage Examples

### **In Login.jsx**
```javascript
import { authAPI } from "../../utils/apiService";

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await authAPI.login(email, password);
    if (response.success) {
      login(response.user, response.token); // Update context
      navigate("/find-jobs");
    }
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};
```

### **In JobSeekerDashboard.jsx** (example implementation)
```javascript
import { jobAPI, applicationAPI, savedJobAPI } from "../../utils/apiService";

// Get all jobs
const [jobs, setJobs] = useState([]);
useEffect(() => {
  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getAllJobs();
      setJobs(response.jobs);
    } catch (error) {
      toast.error("Failed to load jobs");
    }
  };
  fetchJobs();
}, []);

// Apply for a job
const handleApply = async (jobId) => {
  try {
    const response = await applicationAPI.applyForJob(jobId);
    toast.success("Application submitted!");
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

// Save a job
const handleSave = async (jobId) => {
  try {
    await savedJobAPI.saveJob(jobId);
    toast.success("Job saved!");
  } catch (error) {
    toast.error("Failed to save job");
  }
};
```

### **In EmployerDashboard.jsx** (example implementation)
```javascript
import { jobAPI, applicationAPI, analyticsAPI } from "../../utils/apiService";

// Get employer's jobs
const [myJobs, setMyJobs] = useState([]);
useEffect(() => {
  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getEmployerJobs();
      setMyJobs(response.jobs);
    } catch (error) {
      toast.error("Failed to load jobs");
    }
  };
  fetchJobs();
}, []);

// Get analytics
const [analytics, setAnalytics] = useState(null);
useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getMyAnalytics();
      setAnalytics(response.analytics);
    } catch (error) {
      toast.error("Failed to load analytics");
    }
  };
  fetchAnalytics();
}, []);

// Update application status
const handleApplicationStatus = async (appId, status) => {
  try {
    await applicationAPI.updateApplicationStatus(appId, status);
    toast.success(`Application ${status}!`);
    // Refresh applications list
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};
```

### **In UserProfile.jsx** (example implementation)
```javascript
import { userAPI } from "../../utils/apiService";

// Upload avatar
const handleAvatarUpload = async (file) => {
  try {
    const response = await userAPI.uploadAvatar(file);
    toast.success("Avatar uploaded!");
    setUser({ ...user, avatar: response.avatarUrl });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

// Upload resume (jobseeker)
const handleResumeUpload = async (file) => {
  try {
    const response = await userAPI.uploadResume(file);
    toast.success("Resume uploaded!");
    setUser({ ...user, resume: response.resumeUrl });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

// Update profile
const handleUpdateProfile = async (profileData) => {
  try {
    const response = await userAPI.updateProfile(profileData);
    toast.success("Profile updated!");
    setUser(response.user);
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};
```

---

## 🔐 Authentication Flow Summary

```
┌─────────────────────────────────────────┐
│        First Time User Flow              │
└─────────────────────────────────────────┘

Signup Form
    │
    ▼
authAPI.register(userData)
    │
    ▼
Backend: POST /auth/register
    │
    ├─ Hash password with bcrypt
    ├─ Store user in MongoDB
    ├─ Return success message
    │
    ▼
Frontend: Redirect to Login
    └─ User logs in from here


┌─────────────────────────────────────────┐
│     Returning User Flow                  │
└─────────────────────────────────────────┘

Login Form (email, password)
    │
    ▼
authAPI.login(email, password)
    │
    ▼
Backend: POST /auth/login
    │
    ├─ Find user by email
    ├─ Compare password with hash
    ├─ Generate JWT token (valid 7 days)
    ├─ Return: { success: true, token, user }
    │
    ▼
Frontend: AuthContext.login(user, token)
    │
    ├─ Store token in localStorage
    ├─ Store user in localStorage
    ├─ Update AuthContext state
    │
    ▼
Redirect to appropriate dashboard
    ├─ Employer → /employer-dashboard
    ├─ Job Seeker → /find-jobs


┌─────────────────────────────────────────┐
│     Protected Request Flow               │
└─────────────────────────────────────────┘

Component calls: jobAPI.getAllJobs()
    │
    ▼
axiosInstance.get("/jobs")
    │
    ├─ Request Interceptor:
    │  Get token from localStorage
    │  Add to header: "Authorization: Bearer [token]"
    │
    ▼
Backend: GET /jobs
    │
    ├─ Middleware: protect()
    │  ├─ Check Authorization header
    │  ├─ Verify JWT token
    │  ├─ Decode token, get user ID
    │  ├─ Attach user to request
    │  └─ Continue to route handler
    │
    ├─ Route handler executes
    ├─ Database query (find all jobs)
    ├─ Return: { success: true, jobs: [...] }
    │
    ▼
Frontend Response Interceptor:
    │
    ├─ 200 OK? Return data to component
    ├─ 401 Unauthorized? Token invalid/expired
    │   ├─ Clear localStorage
    │   ├─ Redirect to /login
    ├─ Other errors? Pass to catch block
    │
    ▼
Component receives data or error
```

---

## 🎯 Key Integration Principles

### 1. **Separation of Concerns**
- **Components**: Handle UI and user interaction
- **API Service**: Handles API calls
- **Context**: Handles global state
- **Axios Instance**: Handles HTTP communication

### 2. **DRY (Don't Repeat Yourself)**
- Token handling in one place (interceptor)
- Endpoints defined once (apiPaths.js)
- API logic organized (apiService.js)

### 3. **Error Handling**
- All API errors caught and converted to toast notifications
- Network errors handled gracefully
- 401 errors auto-redirect to login
- Backend validation errors shown to user

### 4. **Security**
- JWT tokens never exposed in URLs
- Token stored in localStorage (consider sessionStorage for more security)
- Authorization headers sent automatically
- CORS configured on backend

---

## 🚀 Next Steps for Implementation

### In JobSeekerDashboard.jsx:
1. Import `jobAPI` and `savedJobAPI`
2. Call `jobAPI.getAllJobs()` on component mount
3. Display jobs in grid/list format
4. Add "Apply" button → calls `applicationAPI.applyForJob(jobId)`
5. Add "Save" button → calls `savedJobAPI.saveJob(jobId)`

### In EmployerDashboard.jsx:
1. Import `jobAPI`, `applicationAPI`, `analyticsAPI`
2. Call `jobAPI.getEmployerJobs()` to show my postings
3. Call `analyticsAPI.getMyAnalytics()` to show metrics
4. Add navigation to job details and applications

### In Protected Pages:
- Import `useAuth` hook
- Access user data: `const { user } = useAuth()`
- Show/hide features based on user role

---

## 📊 Integration Checklist

- ✅ apiPaths.js created with all endpoints
- ✅ axiosInstance.js with interceptors
- ✅ apiService.js with organized API functions
- ✅ AuthContext for global auth state
- ✅ Login.jsx integrated with real API
- ✅ Signup.jsx integrated with real API
- ✅ ProtectedRoute implemented
- ✅ App.jsx wrapped with AuthProvider
- ⏳ JobSeekerDashboard - needs jobAPI integration
- ⏳ EmployerDashboard - needs jobAPI, applicationAPI, analyticsAPI
- ⏳ JobDetails - needs jobAPI
- ⏳ SavedJobs - needs savedJobAPI
- ⏳ UserProfile - needs userAPI
- ⏳ JobPostingForm - needs jobAPI
- ⏳ ManageJobs - needs jobAPI
- ⏳ ApplicationViewer - needs applicationAPI
- ⏳ EmployerProfilePage - needs userAPI

---

**All API infrastructure is ready. Now focus on implementing the individual pages to use the API functions!**
