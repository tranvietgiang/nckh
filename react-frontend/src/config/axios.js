import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  //   withCredentials: false, // vẫn false vì không dùng cookie/token
});

// // Thêm interceptor để tự gắn token
// instance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token"); // hoặc lấy từ Pinia/Redux
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default instance;
