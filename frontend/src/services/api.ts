import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:8000/api`;
  }
  return 'http://127.0.0.1:8000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle Unauthorized Expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
    }
    const errorMsg = error.response?.data?.detail || error.message || 'Error en la solicitud al servidor';
    console.error('API Error:', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
);

export default api;

