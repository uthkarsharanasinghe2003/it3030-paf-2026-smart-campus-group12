import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaTicketAlt,
} from "react-icons/fa";
import logo from "../../../image/logo.png";
import "./TechnicianSidebar.css";

export default function TechnicianSidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = useMemo(
    () => [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: <FaTachometerAlt />,
        path: "/technician/dashboard",
      },
      {
        key: "tickets",
        label: "Tickets",
        icon: <FaTicketAlt />,
        path: "/technician/tickets",
      },
    ],
    []
  );

  useEffect(() => {
    const currentItem = menuItems.find((item) =>
      location.pathname.startsWith(item.path)
    );

    if (currentItem) {
      setActiveTab(currentItem.key);
    }
  }, [location.pathname, menuItems, setActiveTab]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const handleMenuClick = (item) => {
    setActiveTab(item.key);
    navigate(item.path);
  };

  return (
    <aside
      className={`technician-sidebar ${sidebarOpen ? "open" : "closed"}`}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
      <div>
        <div className="technician-sidebar-top">
          <div className="technician-sidebar-brand">
            <div className="technician-sidebar-logo">
              <img
                src={logo}
                alt="Logo"
                className="technician-sidebar-logo-img"
              />
            </div>

            {sidebarOpen && (
              <div className="technician-sidebar-brand-text">
                <h2>Technician Panel</h2>
                <p>Service Center</p>
              </div>
            )}
          </div>
        </div>

        <div className="technician-sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`technician-sidebar-item ${
                activeTab === item.key ? "active" : ""
              }`}
              onClick={() => handleMenuClick(item)}
              type="button"
            >
              <span className="technician-sidebar-icon">{item.icon}</span>
              {sidebarOpen && (
                <span className="technician-sidebar-label">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="technician-sidebar-bottom">
        <button
          className="technician-sidebar-item technician-logout-btn"
          onClick={handleLogout}
          type="button"
        >
          <span className="technician-sidebar-icon">
            <FaSignOutAlt />
          </span>
          {sidebarOpen && (
            <span className="technician-sidebar-label">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}