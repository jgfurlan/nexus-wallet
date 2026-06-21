import axios from 'axios';

/**
 * Axios instance configured with the API baseURL, request interceptors
 * to inject JWT bearer tokens, and response interceptors to handle 401 Unauthorized errors.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

// Interceptor para injetar o token JWT foi removido em favor do uso de cookies HttpOnly

// Interceptor para tratar erros 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
