import axios from 'axios';

const envUrl = import.meta.env.VITE_API_URL;
const rawUrl = envUrl && /^https?:\/\//i.test(envUrl) ? envUrl : (envUrl && !envUrl.startsWith('/') ? `https://${envUrl}` : 'http://localhost:5000/api/v1');
const baseURL = rawUrl.replace(/\/+$/, '');

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract standardized DevPulse API error envelope if available
    const apiError = error.response?.data?.error;
    if (apiError) {
      const customErr = new Error(apiError.message || 'API request failed');
      customErr.code = apiError.code;
      customErr.details = apiError.details || [];
      customErr.status = error.response?.status;
      return Promise.reject(customErr);
    }
    return Promise.reject(error);
  }
);
