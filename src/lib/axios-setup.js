// src\lib\axios-setup.js
import axios from "axios";
import { getToken } from "@/features/authentication-v2/queries";

axios.interceptors.request.use((config) => {
  const isOwnApi = config.url?.startsWith(import.meta.env.VITE_API_BASE_URL);
  if (isOwnApi) {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});