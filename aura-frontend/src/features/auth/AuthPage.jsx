import axios from "axios";
import config from "../../constants/config";

const AuthService = {
  
  login: async (payload) => {
    return await axios.post(`${config.apiPath}/api/user/login`, payload);
  },

 
  getUserInfo: async () => {
    const token = localStorage.getItem("token");
    return await axios.get(`${config.apiPath}/api/user/info`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default AuthService;