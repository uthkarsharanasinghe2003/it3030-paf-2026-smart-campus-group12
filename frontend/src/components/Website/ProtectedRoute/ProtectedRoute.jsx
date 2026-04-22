import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}