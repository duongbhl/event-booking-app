// src/services/api.ts
import axios from "axios";

export const API_BASE_URL = "https://event-booking-app-3.onrender.com";
export const API_TIMEOUT_MS = 60000;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  // Render can take a while to wake up after inactivity, especially for demo deployments.
  timeout: API_TIMEOUT_MS,
});

export default api;
