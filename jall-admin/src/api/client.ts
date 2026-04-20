import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:5009',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jall_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jall_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
