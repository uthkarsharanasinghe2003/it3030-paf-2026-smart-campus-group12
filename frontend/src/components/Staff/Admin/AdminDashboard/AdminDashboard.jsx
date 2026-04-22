import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUsers,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaSearch,
  FaBell,
  FaUserShield,
  FaBoxes,
  FaPlusCircle,
  FaCalendarCheck,
  FaTools,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import AdminLayout from "../AdminLayout/AdminLayout";
import "./AdminDashboard.css";

const USERS_API = "http://localhost:8081/api/users";
const STAFF_API = "http://localhost:8081/api/staff";
const BOOKINGS_API = "http://localhost:8081/api/bookings";
const RESOURCES_API = "http://localhost:8081/api/resources";

const NOTIFICATIONS_API = "http://localhost:8081/api/notifications/admin";
const NOTIFICATION_COUNT_API =
  "http://localhost:8081/api/notifications/admin/unread-count";
const READ_NOTIFICATION_API = "http://localhost:8081/api/notifications";
const READ_ALL_API = "http://localhost:8081/api/notifications/admin/read-all";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, staffRes, bookingsRes, resourcesRes] = await Promise.all([
        axios.get(USERS_API),
        axios.get(STAFF_API),
        axios.get(BOOKINGS_API),
        axios.get(RESOURCES_API),
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setStaff(Array.isArray(staffRes.data) ? staffRes.data : []);
      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      setResources(Array.isArray(resourcesRes.data) ? resourcesRes.data : []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      alert("Failed to load dashboard summary");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(NOTIFICATIONS_API);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(NOTIFICATION_COUNT_API);
      setUnreadCount(res.data?.count || 0);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const handleBellClick = async () => {
    const next = !showNotificationPanel;
    setShowNotificationPanel(next);

    if (next) {
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`${READ_NOTIFICATION_API}/${id}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      alert("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch(READ_ALL_API);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      alert("Failed to mark all notifications as read");
    }
  };

  const summary = useMemo(() => {
    const activeUsers = users.filter((u) => u.active && !u.deleted).length;
    const blockedUsers = users.filter((u) => !u.active || u.deleted).length;

    const adminCount = staff.filter((s) => s.role === "ADMIN").length;
    const technicianCount = staff.filter((s) => s.role === "TECHNICIAN").length;

    const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
    const approvedBookings = bookings.filter((b) => b.status === "APPROVED").length;
    const rejectedBookings = bookings.filter((b) => b.status === "REJECTED").length;

    const activeResources = resources.filter((r) => r.status === "ACTIVE").length;
    const outOfServiceResources = resources.filter(
      (r) => r.status === "OUT_OF_SERVICE"
    ).length;

    return {
      totalUsers: users.length,
      activeUsers,
      blockedUsers,
      totalStaff: staff.length,
      adminCount,
      technicianCount,
      totalBookings: bookings.length,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      totalResources: resources.length,
      activeResources,
      outOfServiceResources,
    };
  }, [users, staff, bookings, resources]);

  const stats = [
    {
      title: "Total Users",
      value: summary.totalUsers,
      change: `${summary.activeUsers} Active`,
      type: "up",
      icon: <FaUsers />,
    },
    {
      title: "Total Staff",
      value: summary.totalStaff,
      change: `${summary.adminCount} Admins`,
      type: "up",
      icon: <FaUserShield />,
    },
    {
      title: "Total Bookings",
      value: summary.totalBookings,
      change: `${summary.pendingBookings} Pending`,
      type: "warning",
      icon: <FaClipboardCheck />,
    },
    {
      title: "Total Resources",
      value: summary.totalResources,
      change: `${summary.activeResources} Active`,
      type: "up",
      icon: <FaBoxes />,
    },
  ];

  const recentUsers = [...users].slice(0, 5);

  const recentActivities = [
    {
      title: "Users Summary",
      desc: `${summary.activeUsers} active users and ${summary.blockedUsers} blocked users`,
      time: "Live",
      status: "success",
    },
    {
      title: "Staff Summary",
      desc: `${summary.adminCount} admins and ${summary.technicianCount} technicians`,
      time: "Live",
      status: "success",
    },
    {
      title: "Booking Summary",
      desc: `${summary.pendingBookings} pending, ${summary.approvedBookings} approved, ${summary.rejectedBookings} rejected`,
      time: "Live",
      status: summary.pendingBookings > 0 ? "warning" : "success",
    },
    {
      title: "Resource Summary",
      desc: `${summary.activeResources} active resources, ${summary.outOfServiceResources} out of service`,
      time: "Live",
      status: summary.outOfServiceResources > 0 ? "danger" : "success",
    },
  ];

  return (
    <AdminLayout activeTab="dashboard">
      <div className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <div>
            <p className="admin-dashboard-welcome">Welcome back</p>
            <h1>Admin Dashboard</h1>
          </div>

          <div className="admin-dashboard-header-right">
            <div className="admin-search-box">
              <FaSearch />
              <input type="text" placeholder="Search here..." />
            </div>

            <div className="admin-notification-wrap">
              <button
                className="admin-icon-btn"
                type="button"
                onClick={handleBellClick}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="admin-notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotificationPanel && (
                <div className="admin-notification-panel">
                  <div className="admin-notification-panel-head">
                    <h3>Notifications</h3>
                    <button type="button" onClick={handleMarkAllAsRead}>
                      Mark all as read
                    </button>
                  </div>

                  <div className="admin-notification-list">
                    {notifications.length === 0 ? (
                      <div className="admin-notification-empty">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`admin-notification-item ${
                            item.read ? "read" : "unread"
                          }`}
                        >
                          <div className="admin-notification-content">
                            <h4>{item.title}</h4>
                            <p>{item.message}</p>
                            <span>
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleString()
                                : "Now"}
                            </span>
                          </div>

                          {!item.read && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(item.id)}
                            >
                              Read
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-profile-box">
              <div className="admin-profile-avatar">
                <FaUserShield />
              </div>
              <div>
                <h4>Admin User</h4>
                <p>Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="admin-panel admin-table-panel">
            <div className="admin-empty-state">
              <h3>Loading dashboard summary...</h3>
              <p>Please wait while the system data is loading.</p>
            </div>
          </div>
        ) : (
          <>
            <section className="admin-stats-grid">
              {stats.map((stat, index) => (
                <div className="admin-stat-card" key={index}>
                  <div className="admin-stat-card-top">
                    <div className="admin-stat-icon">{stat.icon}</div>
                    <div
                      className={`admin-stat-badge ${
                        stat.type === "up"
                          ? "success"
                          : stat.type === "down"
                          ? "neutral"
                          : "warning"
                      }`}
                    >
                      {stat.type === "up" ? <FaArrowUp /> : <FaArrowDown />}
                      {stat.change}
                    </div>
                  </div>
                  <h3>{stat.value}</h3>
                  <p>{stat.title}</p>
                </div>
              ))}
            </section>

            <section className="admin-content-grid">
              <div className="admin-panel admin-activity-panel">
                <div className="admin-panel-header">
                  <h2>Live Module Summary</h2>
                  <button type="button" onClick={fetchDashboardData}>
                    Refresh
                  </button>
                </div>

                <div className="admin-activity-list">
                  {recentActivities.map((activity, index) => (
                    <div className="admin-activity-item" key={index}>
                      <div className={`admin-activity-dot ${activity.status}`}></div>
                      <div className="admin-activity-text">
                        <h4>{activity.title}</h4>
                        <p>{activity.desc}</p>
                      </div>
                      <span>{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-panel admin-summary-panel">
                <div className="admin-panel-header">
                  <h2>System Summary</h2>
                </div>

                <div className="admin-summary-cards">
                  <div className="summary-mini-card">
                    <span>Pending Bookings</span>
                    <h3>{summary.pendingBookings}</h3>
                  </div>

                  <div className="summary-mini-card">
                    <span>Approved Bookings</span>
                    <h3>{summary.approvedBookings}</h3>
                  </div>

                  <div className="summary-mini-card">
                    <span>Admins</span>
                    <h3>{summary.adminCount}</h3>
                  </div>

                  <div className="summary-mini-card">
                    <span>Technicians</span>
                    <h3>{summary.technicianCount}</h3>
                  </div>

                  <div className="summary-mini-card">
                    <span>Blocked Users</span>
                    <h3>{summary.blockedUsers}</h3>
                  </div>

                  <div className="summary-mini-card">
                    <span>Out of Service</span>
                    <h3>{summary.outOfServiceResources}</h3>
                  </div>
                </div>

                <div className="admin-quick-action-wrap">
                  <button
                    type="button"
                    className="admin-quick-resource-btn"
                    onClick={() => navigate("/admin/resources")}
                  >
                    <FaPlusCircle />
                    Manage Resources
                  </button>

                  <button
                    type="button"
                    className="admin-quick-booking-btn"
                    onClick={() => navigate("/admin/bookings")}
                  >
                    <FaCalendarCheck />
                    Manage Bookings
                  </button>

                  <button
                    type="button"
                    className="admin-quick-resource-btn"
                    onClick={() => navigate("/admin/users")}
                  >
                    <FaUsers />
                    Manage Users
                  </button>

                  <button
                    type="button"
                    className="admin-quick-booking-btn"
                    onClick={() => navigate("/admin/staff")}
                  >
                    <FaTools />
                    Manage Staff
                  </button>
                </div>
              </div>
            </section>

            <section className="admin-content-grid">
              <div className="admin-panel admin-summary-panel">
                <div className="admin-panel-header">
                  <h2>Booking Status Overview</h2>
                </div>

                <div className="admin-summary-cards">
                  <div className="summary-mini-card">
                    <span>
                      <FaClock style={{ marginRight: "8px" }} />
                      Pending
                    </span>
                    <h3>{summary.pendingBookings}</h3>
                  </div>

                  <div className="summary-mini-card">
                    <span>
                      <FaCheckCircle style={{ marginRight: "8px" }} />
                      Approved
                    </span>
                    <h3>{summary.approvedBookings}</h3>
                  </div>

                  <div className="summary-mini-card">
                    <span>
                      <FaTimesCircle style={{ marginRight: "8px" }} />
                      Rejected
                    </span>
                    <h3>{summary.rejectedBookings}</h3>
                  </div>

                  <div className="summary-mini-card">
                    <span>
                      <FaExclamationTriangle style={{ marginRight: "8px" }} />
                      Out of Service
                    </span>
                    <h3>{summary.outOfServiceResources}</h3>
                  </div>
                </div>
              </div>

              <div className="admin-panel admin-summary-panel">
                <div className="admin-panel-header">
                  <h2>Module Navigation</h2>
                </div>

                <div className="admin-summary-cards">
                  <div
                    className="summary-mini-card summary-clickable"
                    onClick={() => navigate("/admin/users")}
                  >
                    <span>Users Module</span>
                    <h3>{summary.totalUsers}</h3>
                  </div>

                  <div
                    className="summary-mini-card summary-clickable"
                    onClick={() => navigate("/admin/staff")}
                  >
                    <span>Staff Module</span>
                    <h3>{summary.totalStaff}</h3>
                  </div>

                  <div
                    className="summary-mini-card summary-clickable"
                    onClick={() => navigate("/admin/bookings")}
                  >
                    <span>Bookings Module</span>
                    <h3>{summary.totalBookings}</h3>
                  </div>

                  <div
                    className="summary-mini-card summary-clickable"
                    onClick={() => navigate("/admin/resources")}
                  >
                    <span>Resources Module</span>
                    <h3>{summary.totalResources}</h3>
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-panel admin-table-panel">
              <div className="admin-panel-header">
                <h2>Recent Users</h2>
                <button type="button" onClick={() => navigate("/admin/users")}>
                  Manage Users
                </button>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          No users available
                        </td>
                      </tr>
                    ) : (
                      recentUsers.map((user) => {
                        const isActive = user.active && !user.deleted;

                        return (
                          <tr key={user.id}>
                            <td>{user.fullName || "Unnamed User"}</td>
                            <td>{user.role || "USER"}</td>
                            <td>{user.email}</td>
                            <td>
                              <span
                                className={`admin-status-badge ${
                                  isActive ? "active" : "blocked"
                                }`}
                              >
                                {isActive ? "Active" : "Blocked"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}