// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err.response?.status;

    // 401: dispatch global logout event and redirect
    if (status === 401) {
      try { window.dispatchEvent(new CustomEvent("auth:logout")); } catch (e) {}
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(err);
    }

    // 429: simple retry with exponential backoff (up to 2 retries)
    if (status === 429) {
      const config = err.config || {};
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount >= 2) return Promise.reject(err);
      config.__retryCount += 1;
      const delay = Math.pow(2, config.__retryCount) * 500;
      return new Promise((resolve) => setTimeout(resolve, delay)).then(() => api.request(config));
    }

    return Promise.reject(err);
  }
);

export default api;

// ─────────────────────────────────────────────────────────────────────────────
