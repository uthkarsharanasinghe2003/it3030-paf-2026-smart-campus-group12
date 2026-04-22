import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestRoute() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <Outlet />;

  if (user.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "TECHNICIAN") {
    return <Navigate to="/technician/dashboard" replace />;
  }

  return <Navigate to="/user/dashboard" replace />;
}