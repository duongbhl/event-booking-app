// src/services/api.ts
import axios from "axios";

export const API_BASE_URL = "https://event-booking-app-3.onrender.com";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds
});

export default api;
