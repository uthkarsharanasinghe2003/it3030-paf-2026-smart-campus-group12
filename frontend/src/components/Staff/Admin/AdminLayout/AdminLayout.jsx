import React, { useState } from "react";
import AdminSidebar from "../AdminSidebar/AdminSidebar";
import "./AdminLayout.css";

export default function AdminLayout({ children, activeTab = "dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(activeTab);

  return (
    <div className="admin-layout">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={currentTab}
        setActiveTab={setCurrentTab}
      />

      <main className="admin-layout-content">{children}</main>
    </div>
  );
}