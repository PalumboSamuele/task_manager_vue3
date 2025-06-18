import axios from "axios";

// Crea un'istanza personalizzata di Axios
const api = axios.create({
  baseURL: "https://task-manager-backend-ygff.onrender.com/task-manager/api/v1",
});

// Endpoints pubblici (non richiedono Authorization)
const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/register"];

// Interceptor della richiesta
api.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || "";

    // Se l'URL è tra quelli pubblici, non aggiunge l'Authorization header
    const isPublic = PUBLIC_ENDPOINTS.some((path) => requestUrl.includes(path));
    if (isPublic) {
      return config;
    }

    const token = localStorage.getItem("token");
    const expiration = localStorage.getItem("expiration");

    if (!token || !expiration) {
      return Promise.reject(new Error("Missing or expired token."));
    }

    const now = new Date().getTime();
    if (now > +expiration) {
      return Promise.reject(new Error("Token expired."));
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
