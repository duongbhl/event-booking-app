// src/services/api.ts
import axios from "axios";


const api = axios.create({
  baseURL: `http://192.168.100.6:5000/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default api;
