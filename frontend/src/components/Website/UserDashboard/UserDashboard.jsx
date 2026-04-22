import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./UserDashboard.css";
import RegisteredNavbar from "../Navbar/RegisteredNavbar/RegisteredNavbar";
import Footer from "../Footer/Footer";

const BOOKING_API = "http://localhost:8081/api/bookings";
const TICKET_API = "http://localhost:8081/api/tickets";
const NOTIFICATION_API = "http://localhost:8081/api/notifications";

export default function UserDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userEmail = user?.email || "";
  const displayName = user?.fullName || user?.name || user?.email || "User";

  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    if (!userEmail) return;

    fetchBookings();
    fetchTickets();
    fetchNotifications();
  }, [userEmail]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await axios.get(BOOKING_API);
      const allBookings = Array.isArray(res.data) ? res.data : [];

      const myBookings = allBookings
        .filter(
          (booking) =>
            (booking.userEmail || "").toLowerCase() === userEmail.toLowerCase()
        )
        .sort((a, b) => (b.id || 0) - (a.id || 0));

      setBookings(myBookings);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await axios.get(`${TICKET_API}/user`, {
        params: {
          email: userEmail,
          status: "ALL",
        },
      });

      const myTickets = Array.isArray(res.data) ? res.data : [];
      setTickets(myTickets);
    } catch (error) {
      console.error("Failed to load tickets:", error);
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await axios.get(`${NOTIFICATION_API}/user`, {
        params: { email: userEmail },
      });

      const myNotifications = Array.isArray(res.data) ? res.data : [];
      setNotifications(myNotifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const bookingSummary = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      approved: bookings.filter((b) => b.status === "APPROVED").length,
      rejected: bookings.filter((b) => b.status === "REJECTED").length,
    };
  }, [bookings]);

  const ticketSummary = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: tickets.filter((t) => t.status === "RESOLVED").length,
      rejected: tickets.filter((t) => t.status === "REJECTED").length,
    };
  }, [tickets]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter((item) => !item.isRead && !item.read).length;
  }, [notifications]);

  const recentBookings = useMemo(() => {
    return bookings.slice(0, 3).map((booking) => ({
      id: `BK-${booking.id}`,
      resource: booking.resourceName || "Unnamed Resource",
      date: booking.bookingDate || "N/A",
      time: booking.bookingTime || "N/A",
      status:
        booking.status === "APPROVED"
          ? "Approved"
          : booking.status === "REJECTED"
          ? "Rejected"
          : "Pending",
    }));
  }, [bookings]);

  const recentTickets = useMemo(() => {
    return tickets.slice(0, 3).map((ticket) => ({
      id: ticket.ticketCode || `TK-${ticket.id}`,
      category: ticket.category || "General Issue",
      location: ticket.resourceLocation || "N/A",
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

  const notificationPreview = useMemo(() => {
    return notifications.slice(0, 3).map((item) => ({
      id: item.id,
      title: item.title || "Notification",
      description: item.message || "No details available",
      type:
        (item.title || "").toLowerCase().includes("approved") ||
        (item.title || "").toLowerCase().includes("resolved")
          ? "success"
          : (item.title || "").toLowerCase().includes("rejected")
          ? "danger"
          : "info",
    }));
  }, [notifications]);

  const loading = loadingBookings || loadingTickets || loadingNotifications;

  return (
    <>
      <RegisteredNavbar />

      <div className="userdash-page">
        <div className="userdash-page-overlay"></div>

        <div className="userdash-container">
          <section className="userdash-hero">
            <div className="userdash-hero-left">
              <div className="userdash-chip">User Dashboard</div>
              <h1>
                Welcome back, <span>{displayName}</span>
              </h1>
              <p>
                Manage your bookings, maintenance tickets, and account activity
                from one simple dashboard.
              </p>

              <div className="userdash-quick-actions">
                <Link to="/resources" className="userdash-btn userdash-btn-primary">
                  Browse Resources
                </Link>
                <Link to="/my-bookings" className="userdash-btn userdash-btn-accent">
                  My Bookings
                </Link>
                <Link to="/create-ticket" className="userdash-btn userdash-btn-outline">
                  Report Issue
                </Link>
              </div>
            </div>

            <div className="userdash-hero-right">
              <div className="userdash-highlight-card">
                <div className="userdash-highlight-topline">Activity Overview</div>
                <h3>Unread Notifications</h3>
                <div className="userdash-notification-count">
                  {loadingNotifications ? "..." : unreadNotifications}
                </div>
                <p>Check the bell icon in the navbar for the latest updates.</p>
                <Link to="/my-tickets" className="userdash-inline-link">
                  View Ticket Updates
                </Link>
              </div>
            </div>
          </section>

          <section className="userdash-summary-grid">
            <div className="userdash-summary-card">
              <h3>My Bookings</h3>
              <div className="userdash-summary-number">
                {loadingBookings ? "..." : bookingSummary.total}
              </div>
              <div className="userdash-summary-stats">
                <span className="approved">
                  Approved: {bookingSummary.approved}
                </span>
                <span className="pending">
                  Pending: {bookingSummary.pending}
                </span>
                <span className="cancelled">
                  Rejected: {bookingSummary.rejected}
                </span>
              </div>
            </div>

            <div className="userdash-summary-card">
              <h3>My Tickets</h3>
              <div className="userdash-summary-number">
                {loadingTickets ? "..." : ticketSummary.total}
              </div>
              <div className="userdash-summary-stats">
                <span className="open">Open: {ticketSummary.open}</span>
                <span className="progress">
                  In Progress: {ticketSummary.inProgress}
                </span>
                <span className="resolved">
                  Resolved: {ticketSummary.resolved}
                </span>
              </div>
            </div>

            <div className="userdash-summary-card">
              <h3>Quick Access</h3>
              <div className="userdash-short-links">
                <Link to="/my-bookings">View Bookings</Link>
                <Link to="/my-tickets">View Tickets</Link>
                <Link to="/profile">My Profile</Link>
              </div>
            </div>
          </section>

          <section className="userdash-content-grid">
            <div className="userdash-panel">
              <div className="userdash-panel-head">
                <h2>Recent Bookings</h2>
                <Link to="/my-bookings">See All</Link>
              </div>

              {loading ? (
                <div className="userdash-list-empty">Loading bookings...</div>
              ) : recentBookings.length === 0 ? (
                <div className="userdash-list-empty">No bookings yet</div>
              ) : (
                <div className="userdash-list">
                  {recentBookings.map((booking) => (
                    <div className="userdash-list-card" key={booking.id}>
                      <div className="userdash-list-top">
                        <h3>{booking.resource}</h3>
                        <span
                          className={`userdash-status-badge ${booking.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p>{booking.id}</p>
                      <p>{booking.date}</p>
                      <p>{booking.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="userdash-panel">
              <div className="userdash-panel-head">
                <h2>Recent Tickets</h2>
                <Link to="/my-tickets">See All</Link>
              </div>

              {loading ? (
                <div className="userdash-list-empty">Loading tickets...</div>
              ) : recentTickets.length === 0 ? (
                <div className="userdash-list-empty">No tickets yet</div>
              ) : (
                <div className="userdash-list">
                  {recentTickets.map((ticket) => (
                    <div className="userdash-list-card" key={ticket.id}>
                      <div className="userdash-list-top">
                        <h3>{ticket.category}</h3>
                        <span
                          className={`userdash-status-badge ${ticket.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <p>{ticket.id}</p>
                      <p>{ticket.location}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="userdash-notification-panel">
            <div className="userdash-panel-head">
              <h2>Notifications Preview</h2>
              <Link to="/my-tickets">Open Tickets</Link>
            </div>

            {loading ? (
              <div className="userdash-list-empty">Loading notifications...</div>
            ) : notificationPreview.length === 0 ? (
              <div className="userdash-list-empty">No notifications yet</div>
            ) : (
              <div className="userdash-notification-list">
                {notificationPreview.map((item) => (
                  <div
                    key={item.id}
                    className={`userdash-notification-card ${item.type}`}
                  >
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}