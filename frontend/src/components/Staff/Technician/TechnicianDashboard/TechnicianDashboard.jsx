import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaSearch,
  FaBell,
  FaUserCog,
  FaPlusCircle,
  FaTicketAlt,
  FaExclamationTriangle,
  FaTools,
  FaClock,
} from "react-icons/fa";
import axios from "axios";
import TechnicianLayout from "../TechnicianLayout/TechnicianLayout";
import "./TechnicianDashboard.css";

const TECH_NOTIFICATION_API = "http://localhost:8081/api/notifications";
const TICKET_API = "http://localhost:8081/api/tickets";

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const technician = JSON.parse(localStorage.getItem("user") || "null");
  const technicianEmail = technician?.email || "";
  const technicianName =
    technician?.fullName || technician?.name || "Technician User";

  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    if (technicianEmail) {
      fetchNotifications();
      fetchUnreadCount();
      fetchTickets();
    }
  }, [technicianEmail]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotificationPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await axios.get(`${TICKET_API}/technician`, {
        params: { email: technicianEmail },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const sorted = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
      setTickets(sorted);
    } catch (error) {
      console.error("Failed to load technician tickets:", error);
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${TECH_NOTIFICATION_API}/technician`, {
        params: { email: technicianEmail },
      });
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load technician notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        `${TECH_NOTIFICATION_API}/technician/unread-count`,
        {
          params: { email: technicianEmail },
        }
      );
      setUnreadCount(res.data?.count || 0);
    } catch (error) {
      console.error("Failed to load unread technician count:", error);
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
      await axios.patch(`${TECH_NOTIFICATION_API}/${id}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark technician notification as read:", error);
      alert("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch(`${TECH_NOTIFICATION_API}/technician/read-all`, null, {
        params: { email: technicianEmail },
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark all technician notifications as read:", error);
      alert("Failed to mark all notifications as read");
    }
  };

  const summary = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "OPEN").length;
    const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
    const resolved = tickets.filter((t) => t.status === "RESOLVED").length;
    const urgent = tickets.filter((t) => t.priority === "URGENT").length;
    const high = tickets.filter((t) => t.priority === "HIGH").length;

    return {
      total,
      open,
      inProgress,
      resolved,
      urgent,
      high,
    };
  }, [tickets]);

  const stats = [
    {
      title: "Assigned Tickets",
      value: loadingTickets ? "..." : summary.total,
      change: `${summary.total} total`,
      type: "up",
      icon: <FaTicketAlt />,
    },
    {
      title: "Open Tickets",
      value: loadingTickets ? "..." : summary.open,
      change: `${summary.high} high priority`,
      type: "warning",
      icon: <FaExclamationTriangle />,
    },
    {
      title: "In Progress",
      value: loadingTickets ? "..." : summary.inProgress,
      change: "Active work",
      type: "up",
      icon: <FaTools />,
    },
    {
      title: "Resolved",
      value: loadingTickets ? "..." : summary.resolved,
      change: "Completed",
      type: "up",
      icon: <FaCheckCircle />,
    },
  ];

  const recentActivities = useMemo(() => {
    return tickets.slice(0, 4).map((ticket) => ({
      title: ticket.ticketCode || `TKT-${ticket.id}`,
      desc: `${ticket.category || "General Issue"} - ${
        ticket.resourceLocation || "Unknown Location"
      }`,
      time: ticket.updatedAt
        ? new Date(ticket.updatedAt).toLocaleString()
        : ticket.createdAt
        ? new Date(ticket.createdAt).toLocaleString()
        : "Recently",
      status:
        ticket.status === "RESOLVED"
          ? "success"
          : ticket.status === "IN_PROGRESS"
          ? "warning"
          : ticket.status === "REJECTED"
          ? "danger"
          : "info",
    }));
  }, [tickets]);

  const issueQueue = useMemo(() => {
    return tickets.slice(0, 5).map((ticket) => ({
      resource: ticket.resourceLocation || "N/A",
      issue: ticket.category || "General Issue",
      priority:
        ticket.priority === "URGENT"
          ? "Urgent"
          : ticket.priority === "HIGH"
          ? "High"
          : ticket.priority === "MEDIUM"
          ? "Medium"
          : "Low",
      status:
        ticket.status === "IN_PROGRESS"
          ? "In Progress"
          : ticket.status === "RESOLVED"
          ? "Resolved"
          : ticket.status === "REJECTED"
          ? "Rejected"
          : "Open",
    }));
  }, [tickets]);

  return (
    <TechnicianLayout activeTab="dashboard">
      <div className="technician-dashboard-main">
        <header className="technician-dashboard-header">
          <div>
            <p className="technician-dashboard-welcome">Welcome back</p>
            <h1>Technician Dashboard</h1>
          </div>

          <div className="technician-dashboard-header-right">
            <div className="technician-search-box">
              <FaSearch />
              <input type="text" placeholder="Search tasks, issues..." />
            </div>

            <div className="technician-notification-wrap" ref={notificationRef}>
              <button
                className="technician-icon-btn"
                type="button"
                onClick={handleBellClick}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="technician-notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotificationPanel && (
                <div className="technician-notification-panel">
                  <div className="technician-notification-panel-head">
                    <h3>Notifications</h3>
                    <button type="button" onClick={handleMarkAllAsRead}>
                      Mark all as read
                    </button>
                  </div>

                  <div className="technician-notification-list">
                    {notifications.length === 0 ? (
                      <div className="technician-notification-empty">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`technician-notification-item ${
                            item.read || item.isRead ? "read" : "unread"
                          }`}
                        >
                          <div className="technician-notification-content">
                            <h4>{item.title}</h4>
                            <p>{item.message}</p>
                            <span>
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleString()
                                : "Now"}
                            </span>
                          </div>

                          {!item.read && !item.isRead && (
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

            <div className="technician-profile-box">
              <div className="technician-profile-avatar">
                <FaUserCog />
              </div>
              <div>
                <h4>{technicianName}</h4>
                <p>Maintenance Staff</p>
              </div>
            </div>
          </div>
        </header>

        <section className="technician-stats-grid">
          {stats.map((stat, index) => (
            <div className="technician-stat-card" key={index}>
              <div className="technician-stat-card-top">
                <div className="technician-stat-icon">{stat.icon}</div>
                <div
                  className={`technician-stat-badge ${
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

        <section className="technician-content-grid">
          <div className="technician-panel technician-activity-panel">
            <div className="technician-panel-header">
              <h2>Recent Ticket Activity</h2>
              <button type="button" onClick={() => navigate("/technician/tickets")}>
                View Tickets
              </button>
            </div>

            <div className="technician-activity-list">
              {recentActivities.length === 0 ? (
                <div className="technician-empty-state">No recent ticket activity</div>
              ) : (
                recentActivities.map((activity, index) => (
                  <div className="technician-activity-item" key={index}>
                    <div className={`technician-activity-dot ${activity.status}`}></div>
                    <div className="technician-activity-text">
                      <h4>{activity.title}</h4>
                      <p>{activity.desc}</p>
                    </div>
                    <span>{activity.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="technician-panel technician-summary-panel">
            <div className="technician-panel-header">
              <h2>Work Summary</h2>
            </div>

            <div className="technician-summary-cards">
              <div className="tech-summary-mini-card">
                <span>Assigned Tickets</span>
                <h3>{loadingTickets ? "..." : summary.total}</h3>
              </div>

              <div className="tech-summary-mini-card">
                <span>Open Tickets</span>
                <h3>{loadingTickets ? "..." : summary.open}</h3>
              </div>

              <div className="tech-summary-mini-card">
                <span>Urgent Issues</span>
                <h3>{loadingTickets ? "..." : summary.urgent}</h3>
              </div>

              <div className="tech-summary-mini-card">
                <span>Resolved Tickets</span>
                <h3>{loadingTickets ? "..." : summary.resolved}</h3>
              </div>
            </div>

            <div className="technician-quick-action-wrap">
              <button
                type="button"
                className="technician-quick-maintenance-btn"
                onClick={() => navigate("/technician/tickets")}
              >
                <FaTicketAlt />
                Manage Tickets
              </button>

              <button
                type="button"
                className="technician-quick-log-btn"
                onClick={() => navigate("/technician/tickets")}
              >
                <FaPlusCircle />
                Update Ticket
              </button>
            </div>
          </div>
        </section>

        <section className="technician-panel technician-table-panel">
          <div className="technician-panel-header">
            <h2>Assigned Ticket Queue</h2>
            <button type="button" onClick={() => navigate("/technician/tickets")}>
              Manage Tickets
            </button>
          </div>

          <div className="technician-table-wrapper">
            <table className="technician-issues-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {issueQueue.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="technician-empty-row">
                      No assigned tickets found
                    </td>
                  </tr>
                ) : (
                  issueQueue.map((item, index) => (
                    <tr key={index}>
                      <td>{item.resource}</td>
                      <td>{item.issue}</td>
                      <td>
                        <span
                          className={`technician-priority-badge ${
                            item.priority === "Urgent"
                              ? "high"
                              : item.priority === "High"
                              ? "high"
                              : item.priority === "Medium"
                              ? "medium"
                              : "low"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`technician-status-badge ${
                            item.status === "Resolved"
                              ? "resolved"
                              : item.status === "In Progress"
                              ? "progress"
                              : item.status === "Rejected"
                              ? "open"
                              : "open"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </TechnicianLayout>
  );
}