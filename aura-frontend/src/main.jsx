import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; 
import "./styles/index.css"; 
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "./features/auth/Login"; 
import DashboardPage from "./Pages/DashboardPage";
import { isAuthenticated } from "./features/auth/auth.service";

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
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
    path: "/audit-logs",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Dashboard",
    element: <Navigate to="/audit-logs" replace />,
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
  //<React.StrictMode>
    <RouterProvider router={router} />
  //</React.StrictMode>
);