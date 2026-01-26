# 🎯 QUICK API INTEGRATION REFERENCE

## File Structure

```
src/
├── utils/
│   ├── apiPaths.js          ← Endpoint definitions
│   ├── axiosInstance.js     ← HTTP client with interceptors
│   └── apiService.js        ← API functions organized by feature
├── context/
│   └── AuthContext.jsx      ← Global authentication state
└── pages/
    ├── Auth/
    │   ├── Login.jsx        ← Uses authAPI.login()
    │   └── Signup.jsx       ← Uses authAPI.register()
    └── routes/
        └── ProtectedRoute.jsx ← Uses useAuth() hook
```

---

## Import Statements (Copy & Paste)

### For Job Seeker Pages:
```javascript
import { useAuth } from "../../context/AuthContext";
import { 
  jobAPI, 
  applicationAPI, 
  savedJobAPI, 
  userAPI 
} from "../../utils/apiService";
```

### For Employer Pages:
```javascript
import { useAuth } from "../../context/AuthContext";
import { 
  jobAPI, 
  applicationAPI, 
  analyticsAPI, 
  userAPI 
} from "../../utils/apiService";
```

---

## API Cheat Sheet

### Get Current User Info
```javascript
const { user, token, isAuthenticated } = useAuth();
// user: { id, name, email, role, avatar, companyName }
// token: JWT token string
// isAuthenticated: boolean
```

### Get All Jobs
```javascript
try {
  const response = await jobAPI.getAllJobs();
  console.log(response.jobs); // Array of job objects
} catch (error) {
  console.error(error.response?.data?.message);
}
```

### Get Specific Job
```javascript
const response = await jobAPI.getJobById(jobId);
console.log(response.job);
```

### Create Job (Employer)
```javascript
const jobData = {
  title: "Senior Developer",
  description: "...",
  requirements: "...",
  location: "New York",
  salary: 120000,
  jobType: "Full-time"
};
const response = await jobAPI.createJob(jobData);
console.log(response.job._id); // New job ID
```

### Get My Jobs (Employer)
```javascript
const response = await jobAPI.getEmployerJobs();
console.log(response.jobs); // Only my jobs
```

### Update Job
```javascript
const response = await jobAPI.updateJob(jobId, updatedData);
```

### Delete Job
```javascript
await jobAPI.deleteJob(jobId);
```

### Toggle Job Status
```javascript
await jobAPI.toggleJobStatus(jobId);
```

### Apply for Job
```javascript
const response = await applicationAPI.applyForJob(jobId);
toast.success("Application submitted!");
```

### Get My Applications (Job Seeker)
```javascript
const response = await applicationAPI.getMyApplications();
console.log(response.applications); // My applications
```

### Get Applications for a Job (Employer)
```javascript
const response = await applicationAPI.getJobApplications(jobId);
console.log(response.applications); // All applications for this job
```

### Update Application Status (Employer)
```javascript
await applicationAPI.updateApplicationStatus(applicationId, "accepted");
// Statuses: "accepted", "rejected", "under review"
```

### Save Job
```javascript
await savedJobAPI.saveJob(jobId);
```

### Get Saved Jobs
```javascript
const response = await savedJobAPI.getSavedJobs();
console.log(response.savedJobs);
```

### Remove Saved Job
```javascript
await savedJobAPI.removeSavedJob(jobId);
```

### Get My Profile
```javascript
const response = await userAPI.getMyProfile();
console.log(response.user);
```

### Update Profile
```javascript
const response = await userAPI.updateProfile({
  name: "New Name",
  email: "newemail@example.com",
  bio: "My bio"
});
```

### Upload Avatar
```javascript
const response = await userAPI.uploadAvatar(fileObject);
console.log(response.avatarUrl);
```

### Upload Resume (Job Seeker)
```javascript
const response = await userAPI.uploadResume(fileObject);
console.log(response.resumeUrl);
```

### Delete Resume
```javascript
await userAPI.deleteResume();
```

### Get Public Profile
```javascript
const response = await userAPI.getPublicProfile(userId);
console.log(response.user); // Public profile data
```

### Get Analytics (Employer)
```javascript
const response = await analyticsAPI.getMyAnalytics();
console.log(response.analytics); // Analytics data
```

---

## Common Patterns

### Loading Jobs with Error Handling
```javascript
const [jobs, setJobs] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await jobAPI.getAllJobs();
      setJobs(response.jobs);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load jobs");
      toast.error(error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchJobs();
}, []);
```

### Form Submission with API Call
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    const response = await jobAPI.createJob(formData);
    toast.success("Job posted successfully!");
    navigate("/manage-jobs");
  } catch (error) {
    toast.error(error.response?.data?.message);
    setIsSubmitting(false);
  }
};
```

### File Upload (Avatar or Resume)
```javascript
const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const response = await userAPI.uploadAvatar(file);
    // or userAPI.uploadResume(file)
    toast.success("File uploaded!");
    setUser({ ...user, avatar: response.avatarUrl });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};
```

### Role-Based Rendering
```javascript
const { user } = useAuth();

if (user?.role === "employer") {
  return <EmployerView />;
} else {
  return <JobSeekerView />;
}
```

---

## Common Error Messages

```javascript
// Handle different error types
try {
  await jobAPI.getAllJobs();
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired - auto redirected by interceptor
    console.log("Redirecting to login...");
  } else if (error.response?.status === 403) {
    // Forbidden - user doesn't have permission
    toast.error("You don't have permission to do this");
  } else if (error.response?.status === 404) {
    // Not found
    toast.error("Resource not found");
  } else if (error.response?.status === 500) {
    // Server error
    toast.error("Server error. Please try again later");
  } else {
    // Network error or other
    toast.error(error.response?.data?.message || "Something went wrong");
  }
}
```

---

## Testing API Calls

### In Browser Console:
```javascript
// Check if token exists
localStorage.getItem("token")

// Check if user is stored
JSON.parse(localStorage.getItem("user"))

// Clear auth (for testing logout)
localStorage.clear()
```

### Example Component for Testing:
```javascript
import { jobAPI } from "../../utils/apiService";

export default function APITest() {
  const handleTest = async () => {
    try {
      const response = await jobAPI.getAllJobs();
      console.log("Jobs:", response);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <button onClick={handleTest}>Test API</button>;
}
```

---

## Common Issues & Solutions

### Issue: "Token not sent to backend"
**Solution**: Check browser DevTools → Network tab → Request Headers should include:
```
Authorization: Bearer [token]
```

### Issue: "401 Unauthorized errors"
**Solution**: Token might be expired. Check:
- Is token in localStorage?
- axiosInstance interceptor should auto-redirect to login
- Check backend token expiry time

### Issue: "CORS errors"
**Solution**: Backend CORS configuration. Check server.js middleware:
```javascript
app.use(cors({ origin: "http://localhost:5173" }));
```

### Issue: "File upload not working"
**Solution**: Use FormData and set correct headers:
```javascript
const formData = new FormData();
formData.append("avatar", fileObject);
// axiosInstance handles multipart/form-data headers automatically
```

---

## Environment Variables (if needed)

Create `.env` file in frontend root:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

Then update apiPaths.js:
```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
```

---

## Performance Tips

1. **Cache data when possible**:
   ```javascript
   const [jobs, setJobs] = useState(null);
   const [isLoading, setIsLoading] = useState(false);
   
   useEffect(() => {
     if (jobs) return; // Don't refetch if already loaded
     
     fetchJobs();
   }, []);
   ```

2. **Debounce search**:
   ```javascript
   import { useEffect, useState } from "react";
   
   const [searchTerm, setSearchTerm] = useState("");
   
   useEffect(() => {
     const timer = setTimeout(() => {
       jobAPI.getAllJobs({ search: searchTerm });
     }, 500); // Wait 500ms before searching
     
     return () => clearTimeout(timer);
   }, [searchTerm]);
   ```

3. **Pagination**:
   ```javascript
   const [page, setPage] = useState(1);
   const response = await jobAPI.getAllJobs({ page, limit: 10 });
   ```

---

## Debugging

### Enable Detailed Logging:
```javascript
// In axiosInstance.js, add logging:
axiosInstance.interceptors.request.use((config) => {
  console.log("Request:", config);
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response:", response.data);
    return response;
  },
  (error) => {
    console.error("Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

### Check Network Tab:
- Open DevTools (F12)
- Network tab
- Filter by XHR/Fetch
- Click request to see:
  - Request headers (Authorization header)
  - Request body
  - Response data
  - Status code

---

## Ready to Implement Pages!

Start with these pages in order:

1. **JobSeekerDashboard.jsx** - Use jobAPI, savedJobAPI
2. **JobDetails.jsx** - Use jobAPI.getJobById()
3. **SavedJobs.jsx** - Use savedJobAPI
4. **EmployerDashboard.jsx** - Use jobAPI, analyticsAPI
5. **JobPostingForm.jsx** - Use jobAPI.createJob()
6. **ManageJobs.jsx** - Use jobAPI
7. **ApplicationViewer.jsx** - Use applicationAPI
8. **UserProfile.jsx** - Use userAPI

Each of these pages already has the basic structure from earlier in the conversation. Just add the API calls!
