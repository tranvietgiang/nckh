import axios from "axios";
import { getToken } from "../Components/Constants/INFO_USER";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// const instance = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   //   withCredentials: false, // vẫn false vì không dùng cookie/token
// });

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
