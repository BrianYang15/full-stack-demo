// src/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { isTokenValid } from "./token";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  if (!isTokenValid(token)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
