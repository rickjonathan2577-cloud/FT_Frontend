import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ,
    withCredentials: true, // Mengatur axios untuk mengirim cookie dengan setiap permintaan
});

api.interceptors.request.use((config) => {
  // Coba ambil token dari cookie browser
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  const token = match ? match[2] : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


export default api;