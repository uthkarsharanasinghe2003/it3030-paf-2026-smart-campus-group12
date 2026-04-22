import React, { useState } from "react";
import TechnicianSidebar from "../TechnicianSidebar/TechnicianSidebar";
import "./TechnicianLayout.css";

export default function TechnicianLayout({
  children,
  activeTab = "dashboard",
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(activeTab);

  return (
    <div className="technician-layout">
      <TechnicianSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={currentTab}
        setActiveTab={setCurrentTab}
      />

      <main className="technician-layout-content">{children}</main>
    </div>
  );
}