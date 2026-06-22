import axios from "axios";
import config from "../../constants/config";

const AuthService = {
  // 1. ส่งข้อมูลเข้าสู่ระบบหลังบ้าน AURA
  login: async (payload) => {
    return await axios.post(`${config.apiPath}/api/user/login`, payload);
  },

  // 2. ตรวจสอบ Token และดึงชื่อเจ้าหน้าที่มาแสดงบน Sidebar
  getUserInfo: async () => {
    const token = localStorage.getItem("token");
    return await axios.get(`${config.apiPath}/api/user/info`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default AuthService; // 👈 ตัวสำคัญที่ระบบเรียกหา!