import axios from 'axios';

/**
 * Axios instance configured with the API baseURL and credentials.
 * All requests include cookies automatically via `withCredentials: true`.
 * The JWT token is managed as an HttpOnly cookie — no Authorization header is used.
 */
const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3000'),
  withCredentials: true,
});

// Interceptor para tratar erros 401 (sessão expirada/inválida)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não redireciona em 401 de rotas de auth (login, register, refresh)
    // pois o erro é tratado pelo componente chamador
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
