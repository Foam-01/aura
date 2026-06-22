const config = {
  
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