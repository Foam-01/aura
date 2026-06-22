import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; 
import "./styles/index.css"; 



import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "./features/auth/Login"; 

// ถ้าไม่มี token ในเครื่อง จะดีดพากลับไปหน้า /login ทันที ป้องกันคนแอบพิมพ์ URL เข้าตรงๆ
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
    
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
  },
 
  /*
  {
    path: "/audit-logs",
    element: (
      <ProtectedRoute>
        <AuditLogPage />
      </ProtectedRoute>
    ),
  }
  */
  {
    // ถ้าพิมพ์ URL มั่ว มารูทที่ไม่มีอยู่จริง ให้ดีดกลับหน้าหลัก
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);