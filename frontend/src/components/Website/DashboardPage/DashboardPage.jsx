import React from "react";

export default function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name || user?.email || "User"}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}