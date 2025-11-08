// src/lib/api.js
import axios from "axios";

export const api = axios.create({
  // 你在 .env 檔裡設定的後端 API 路徑，例如：
  // VITE_API_BASE_URL=http://localhost:8000
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 每次發送請求時自動加上 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
