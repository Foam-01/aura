import axios from "axios";
import config from "../../constants/config";
import { getAuthHeaders } from "./auth.service";

const AuthService = {
  login: async (payload) => {
    return await axios.post(`${config.apiPath}/api/user/login`, payload);
  },

  getUserInfo: async () => {
    return await axios.get(`${config.apiPath}/api/user/info`, {
      headers: getAuthHeaders(),
    });
  },
};

export default AuthService;