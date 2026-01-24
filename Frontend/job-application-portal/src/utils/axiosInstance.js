import axios from "axios";

/**
 * AXIOS INSTANCE SETUP
 *
 * This is a custom axios instance that:
 * 1. Sets the base URL for all API requests
 * 2. Automatically injects the JWT token in request headers
 * 3. Handles 401 errors by redirecting to login (token expired/invalid)
 * 4. Provides consistent error handling across the app
 */

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR
// Runs before every API request - adds the JWT token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// RESPONSE INTERCEPTOR
// Runs after every API response - handles errors and expired tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or invalid (401 Unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
