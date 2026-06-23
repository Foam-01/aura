import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; 
import "./styles/index.css"; 
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "./features/auth/Login"; 
import DashboardPage from "./Pages/DashboardPage";

// 🛡️ ตัวกั้นประตูระดับหน้าด่านแรกของคอร์ระบบ
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/home" replace />, 
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/Dashboard",
    element: (
      // 🔒 [แก้ไขจุดนี้]: เพิ่มระบบตรวจตั๋ว Token ล็อกประตูทางเข้าหน้า Dashboard ให้แน่นหนาครับโฟม
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/home" replace />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);