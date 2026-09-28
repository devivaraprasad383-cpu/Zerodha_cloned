import axios from "axios";
import { API_BASE_URL } from "../config";
import { getToken, clearSession } from "../auth/authStorage";

// A single configured axios instance used everywhere instead of importing
// `axios` directly per-component (which is how the original app called
// `http://localhost:3002/...` from three different files). Every request
// automatically carries the JWT; every 401 automatically logs the user out
// instead of the app silently failing.
const axiosClient = axios.create({ baseURL: API_BASE_URL });

axiosClient.interceptors.request.use((requestConfig) => {
  const token = getToken();
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearSession();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
