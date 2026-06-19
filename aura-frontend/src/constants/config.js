const config = {
  // 🌟 สเปก Vite ปี 2026: ใช้ import.meta.env ในการดึงค่าจากระบบ Cloud/Production
  apiPath: import.meta.env.VITE_API_URL || "http://localhost:3000",
  
  headers: () => {
    return {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    };
  },
};

export default config;