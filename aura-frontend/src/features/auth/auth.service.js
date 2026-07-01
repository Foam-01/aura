import axios from "axios";
import config from "../../constants/config";

const AUTH_TOKEN_KEYS = ["token", "access_token"];

export const getStoredToken = () => {
  for (const key of AUTH_TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
};

export const getAuthHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("access_token", token);
  }
};

export const clearStoredToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
};

export const isAuthenticated = () => Boolean(getStoredToken());

const AuthService = {
  login: async (payload) => {
    return await axios.post(`${config.apiPath}/api/user/login`, payload);
    //return await axios.post("http://172.19.111.45:3000/api/user/login", payload);
  },

  getUserInfo: async () => {
    return await axios.get(`${config.apiPath}/api/user/info`, {
    //return await axios.get("http://172.19.111.45:3000/api/user/info", {
      headers: getAuthHeaders(),
    });
  },
};

export default AuthService;