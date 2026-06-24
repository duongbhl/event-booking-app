// src/services/api.ts
import axios from "axios";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || "http://127.0.0.1:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds
});

export default api;
