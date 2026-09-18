import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ,
    withCredentials: true, // Mengatur axios untuk mengirim cookie dengan setiap permintaan
});

export default api;