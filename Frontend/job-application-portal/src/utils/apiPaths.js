// Centralized API endpoints configuration
// This file acts as a single source of truth for all backend API routes

const BASE_URL = import.meta.env.VITE_API_URL;

// AUTH ENDPOINTS
export const AUTH_ENDPOINTS = {
  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
  GET_ME: `${BASE_URL}/auth/me`,
};

// JOB ENDPOINTS
export const JOB_ENDPOINTS = {
  CREATE_JOB: `${BASE_URL}/jobs`,
  GET_ALL_JOBS: `${BASE_URL}/jobs`,
  GET_JOB_BY_ID: (id) => `${BASE_URL}/jobs/${id}`,
  GET_EMPLOYER_JOBS: `${BASE_URL}/jobs/employer/me`,
  UPDATE_JOB: (id) => `${BASE_URL}/jobs/${id}`,
  DELETE_JOB: (id) => `${BASE_URL}/jobs/${id}`,
  TOGGLE_JOB_STATUS: (id) => `${BASE_URL}/jobs/${id}/toggle`,
};

// APPLICATION ENDPOINTS
export const APPLICATION_ENDPOINTS = {
  APPLY_JOB: (jobId) => `${BASE_URL}/applications/${jobId}`,
  GET_MY_APPLICATIONS: `${BASE_URL}/applications/me`,
  GET_JOB_APPLICATIONS: (jobId) => `${BASE_URL}/applications/job/${jobId}`,
  UPDATE_APPLICATION_STATUS: (id) => `${BASE_URL}/applications/${id}/status`,
};

// SAVED JOB ENDPOINTS
export const SAVED_JOB_ENDPOINTS = {
  SAVE_JOB: (jobId) => `${BASE_URL}/saved-jobs/${jobId}`,
  GET_SAVED_JOBS: `${BASE_URL}/saved-jobs`,
  REMOVE_SAVED_JOB: (jobId) => `${BASE_URL}/saved-jobs/${jobId}`,
};

// USER ENDPOINTS
export const USER_ENDPOINTS = {
  GET_MY_PROFILE: `${BASE_URL}/users/me`,
  UPDATE_PROFILE: `${BASE_URL}/users/me`,
  UPLOAD_AVATAR: `${BASE_URL}/users/me/avatar`,
  UPLOAD_RESUME: `${BASE_URL}/users/me/resume`,
  DELETE_RESUME: `${BASE_URL}/users/me/resume`,
  GET_PUBLIC_PROFILE: (id) => `${BASE_URL}/users/${id}`,
};

// ANALYTICS ENDPOINTS
export const ANALYTICS_ENDPOINTS = {
  GET_MY_ANALYTICS: `${BASE_URL}/analytics/me`,
};

export default {
  AUTH_ENDPOINTS,
  JOB_ENDPOINTS,
  APPLICATION_ENDPOINTS,
  SAVED_JOB_ENDPOINTS,
  USER_ENDPOINTS,
  ANALYTICS_ENDPOINTS,
};
