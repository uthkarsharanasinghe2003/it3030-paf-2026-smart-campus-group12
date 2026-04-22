import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import "./RegisteredNavbar.css";
import logo from "../../../image/logo.png";

const NOTIFICATION_API = "http://localhost:8081/api/notifications";

export default function RegisteredNavbar() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userEmail = user?.email || user?.userEmail || "";

  useEffect(() => {
    if (userEmail) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [userEmail]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await axios.get(`${NOTIFICATION_API}/user`, {
        params: { email: userEmail },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`${NOTIFICATION_API}/user/unread-count`, {
        params: { email: userEmail },
      });
      setUnreadCount(res.data?.count || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const toggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);

    if (nextState && userEmail) {
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${NOTIFICATION_API}/${id}/read`);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true, read: true } : item
        )
      );

      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`${NOTIFICATION_API}/user/read-all`, null, {
        params: { email: userEmail },
      });

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="user-navbar">
      <div className="user-navbar-container">
        <Link to="/user/dashboard" className="user-brand">
          <img
            src={logo}
            alt="Smart Campus Hub Logo"
            className="user-brand-logo"
          />
          <span className="user-brand-text">Smart Campus Hub</span>
        </Link>

        <div className="user-nav-links">
          <Link to="/user/dashboard" className="user-nav-link">
            Dashboard
          </Link>
          <Link to="/resources" className="user-nav-link">
            Resources
          </Link>
          <Link to="/my-bookings" className="user-nav-link">
            My Bookings
          </Link>
          <Link to="/my-tickets" className="user-nav-link">
            My Tickets
          </Link>
          <Link to="/profile" className="user-nav-link">
            Profile
          </Link>
        </div>

        <div className="sch-usernav-actions">
          <div className="sch-usernav-notification-wrapper" ref={dropdownRef}>
            <button
              className="sch-usernav-notification-btn"
              onClick={toggleNotifications}
              type="button"
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="sch-usernav-notification-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="sch-usernav-notification-dropdown">
                <div className="sch-usernav-notification-dropdown-head">
                  <div>
                    <h3>Notifications</h3>
                    <p>Booking updates</p>
                  </div>

                  {notifications.length > 0 && unreadCount > 0 && (
                    <button
                      className="sch-usernav-mark-all-btn"
                      onClick={markAllAsRead}
                      type="button"
                    >
                      Mark all
                    </button>
                  )}
                </div>

                <div className="sch-usernav-notification-dropdown-body">
                  {loadingNotifications ? (
                    <div className="sch-usernav-notification-empty">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="sch-usernav-notification-empty">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`sch-usernav-notification-item ${
                          item.isRead ? "sch-read" : "sch-unread"
                        }`}
                      >
                        <div className="sch-usernav-notification-item-content">
                          <h4>{item.title}</h4>
                          <p>{item.message}</p>
                          <span>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : ""}
                          </span>
                        </div>

                        {!item.isRead && (
                          <button
                            type="button"
                            className="sch-usernav-notification-read-btn"
                            onClick={() => markAsRead(item.id)}
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

          <button className="user-badge-btn">Online</button>

          <button className="user-btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}