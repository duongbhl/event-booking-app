// src/services/api.ts
import axios from "axios";


const api = axios.create({
  baseURL: `http://172.11.103.45:5000/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds
});

export default api;
