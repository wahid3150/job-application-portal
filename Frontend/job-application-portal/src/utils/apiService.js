import axiosInstance from "./axiosInstance";
import {
  AUTH_ENDPOINTS,
  JOB_ENDPOINTS,
  APPLICATION_ENDPOINTS,
  SAVED_JOB_ENDPOINTS,
  USER_ENDPOINTS,
  ANALYTICS_ENDPOINTS,
} from "./apiPaths";

// AUTHENTICATION API
export const authAPI = {
  register: async (userData) => {
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("role", userData.role);
    if (userData.avatar) formData.append("avatar", userData.avatar);
    if (userData.companyName)
      formData.append("companyName", userData.companyName);
    if (userData.companyDescription)
      formData.append("companyDescription", userData.companyDescription);

    const response = await axiosInstance.post(
      AUTH_ENDPOINTS.REGISTER,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  login: async (email, password) => {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get(AUTH_ENDPOINTS.GET_ME);
    return response.data;
  },
};

// JOB API

export const jobAPI = {
  // Get all jobs (public)
  getAllJobs: async (filters = {}) => {
    const response = await axiosInstance.get(JOB_ENDPOINTS.GET_ALL_JOBS, {
      params: filters,
    });
    return response.data;
  },

  // Get single job by ID
  getJobById: async (jobId) => {
    const response = await axiosInstance.get(
      JOB_ENDPOINTS.GET_JOB_BY_ID(jobId),
    );
    return response.data;
  },

  // Create new job (employer only)
  createJob: async (jobData) => {
    const response = await axiosInstance.post(
      JOB_ENDPOINTS.CREATE_JOB,
      jobData,
    );
    return response.data;
  },

  // Get jobs posted by current employer (with optional filters)
  getEmployerJobs: async (filters = {}) => {
    const response = await axiosInstance.get(JOB_ENDPOINTS.GET_EMPLOYER_JOBS, {
      params: filters,
    });
    return response.data;
  },

  // Update job details
  updateJob: async (jobId, jobData) => {
    const response = await axiosInstance.put(
      JOB_ENDPOINTS.UPDATE_JOB(jobId),
      jobData,
    );
    return response.data;
  },

  // Delete a job posting
  deleteJob: async (jobId) => {
    const response = await axiosInstance.delete(
      JOB_ENDPOINTS.DELETE_JOB(jobId),
    );
    return response.data;
  },

  // Toggle job active/inactive status
  toggleJobStatus: async (jobId) => {
    const response = await axiosInstance.patch(
      JOB_ENDPOINTS.TOGGLE_JOB_STATUS(jobId),
    );
    return response.data;
  },
};

// APPLICATION API
export const applicationAPI = {
  // Apply for a job (jobseeker only)
  applyForJob: async (jobId) => {
    const response = await axiosInstance.post(
      APPLICATION_ENDPOINTS.APPLY_JOB(jobId),
    );
    return response.data;
  },

  // Get all applications by current jobseeker
  getMyApplications: async () => {
    const response = await axiosInstance.get(
      APPLICATION_ENDPOINTS.GET_MY_APPLICATIONS,
    );
    return response.data;
  },

  // Get applications for a specific job (employer only)
  getJobApplications: async (jobId) => {
    const response = await axiosInstance.get(
      APPLICATION_ENDPOINTS.GET_JOB_APPLICATIONS(jobId),
    );
    return response.data;
  },

  // Update application status (employer only)
  updateApplicationStatus: async (applicationId, status) => {
    const response = await axiosInstance.patch(
      APPLICATION_ENDPOINTS.UPDATE_APPLICATION_STATUS(applicationId),
      { status },
    );
    return response.data;
  },
};

// SAVED JOB API
export const savedJobAPI = {
  // Save a job to favorites
  saveJob: async (jobId) => {
    const response = await axiosInstance.post(
      SAVED_JOB_ENDPOINTS.SAVE_JOB(jobId),
    );
    return response.data;
  },

  // Get all saved jobs
  getSavedJobs: async () => {
    const response = await axiosInstance.get(
      SAVED_JOB_ENDPOINTS.GET_SAVED_JOBS,
    );
    return response.data;
  },

  // Remove job from saved
  removeSavedJob: async (jobId) => {
    const response = await axiosInstance.delete(
      SAVED_JOB_ENDPOINTS.REMOVE_SAVED_JOB(jobId),
    );
    return response.data;
  },
};

// USER PROFILE API
export const userAPI = {
  _getMyProfileUser: async () => {
    const response = await axiosInstance.get(USER_ENDPOINTS.GET_MY_PROFILE);
    // { success, user: {...} }
    return response.data?.user;
  },

  // Get current user's profile
  getMyProfile: async () => {
    const response = await axiosInstance.get(USER_ENDPOINTS.GET_MY_PROFILE);
    return response.data;
  },

  // Update current user's profile
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put(
      USER_ENDPOINTS.UPDATE_PROFILE,
      profileData,
    );
    // Backend returns { success, message } only → refresh profile for UI
    if (response.data?.success) {
      const user = await userAPI._getMyProfileUser();
      return { ...response.data, user };
    }
    return response.data;
  },

  // Upload profile avatar
  uploadAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    const response = await axiosInstance.put(
      USER_ENDPOINTS.UPLOAD_AVATAR,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    // Backend returns { success, avatar } → refresh profile for UI
    if (response.data?.success) {
      const user = await userAPI._getMyProfileUser();
      return { ...response.data, user };
    }
    return response.data;
  },

  // Upload resume (jobseeker only)
  uploadResume: async (resumeFile) => {
    const formData = new FormData();
    formData.append("resume", resumeFile);
    const response = await axiosInstance.put(
      USER_ENDPOINTS.UPLOAD_RESUME,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    // Backend returns { success, resume } → refresh profile for UI
    if (response.data?.success) {
      const user = await userAPI._getMyProfileUser();
      return { ...response.data, user };
    }
    return response.data;
  },

  // Delete resume
  deleteResume: async () => {
    const response = await axiosInstance.delete(USER_ENDPOINTS.DELETE_RESUME);
    // Backend returns { success, message } → refresh profile for UI
    if (response.data?.success) {
      const user = await userAPI._getMyProfileUser();
      return { ...response.data, user };
    }
    return response.data;
  },

  // Get public profile of any user
  getPublicProfile: async (userId) => {
    const response = await axiosInstance.get(
      USER_ENDPOINTS.GET_PUBLIC_PROFILE(userId),
    );
    return response.data;
  },
};

// ANALYTICS API
export const analyticsAPI = {
  // Get analytics for employer
  getMyAnalytics: async () => {
    const response = await axiosInstance.get(
      ANALYTICS_ENDPOINTS.GET_MY_ANALYTICS,
    );
    return response.data;
  },
};

// Export all APIs
export default {
  authAPI,
  jobAPI,
  applicationAPI,
  savedJobAPI,
  userAPI,
  analyticsAPI,
};
