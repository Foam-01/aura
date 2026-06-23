import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // 🎫 ถ้าไม่มีตั๋ว (Token) ให้ดีดกลับหน้า login ทันที
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔓 ถ้ามีตั๋ว ยอมให้เดินเข้าหน้าบ้านไปเล่นเครื่องเล่นได้
  return children;
}

export default ProtectedRoute;