import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarCheck,
  FaSignOutAlt,
  FaBoxes,
  FaUserShield,
  FaTicketAlt,
} from "react-icons/fa";
import logo from "../../../image/logo.png";
import "./AdminSidebar.css";

export default function AdminSidebar({
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
        path: "/admin/dashboard",
      },
      {
        key: "users",
        label: "Users",
        icon: <FaUsers />,
        path: "/admin/users",
      },
      {
        key: "staff",
        label: "Staff",
        icon: <FaUserShield />,
        path: "/admin/staff",
      },
      {
        key: "bookings",
        label: "Bookings",
        icon: <FaCalendarCheck />,
        path: "/admin/bookings",
      },
      {
        key: "tickets",
        label: "Tickets",
        icon: <FaTicketAlt />,
        path: "/admin/tickets",
      },
      {
        key: "resources",
        label: "Resources",
        icon: <FaBoxes />,
        path: "/admin/resources",
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
      className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
      <div>
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-brand">
            <div className="admin-sidebar-logo">
              <img src={logo} alt="Logo" className="admin-sidebar-logo-img" />
            </div>

            {sidebarOpen && (
              <div className="admin-sidebar-brand-text">
                <h2>Admin Panel</h2>
                <p>Control Center</p>
              </div>
            )}
          </div>
        </div>

        <div className="admin-sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`admin-sidebar-item ${
                activeTab === item.key ? "active" : ""
              }`}
              onClick={() => handleMenuClick(item)}
              type="button"
            >
              <span className="admin-sidebar-icon">{item.icon}</span>
              {sidebarOpen && (
                <span className="admin-sidebar-label">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-sidebar-bottom">
        <button
          className="admin-sidebar-item logout-btn"
          onClick={handleLogout}
          type="button"
        >
          <span className="admin-sidebar-icon">
            <FaSignOutAlt />
          </span>
          {sidebarOpen && <span className="admin-sidebar-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}