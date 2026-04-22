import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaCalendarCheck,
  FaClock,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaInbox,
} from "react-icons/fa";
import RegisteredNavbar from "../Navbar/RegisteredNavbar/RegisteredNavbar";
import Footer from "../Footer/Footer";
import "./MyBookingsPage.css";

const API_BASE = "http://localhost:8081/api/bookings";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userEmail = user?.email || "";

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      const allBookings = Array.isArray(res.data) ? res.data : [];

      const myBookings = allBookings.filter(
        (booking) =>
          (booking.userEmail || "").toLowerCase() === userEmail.toLowerCase()
      );

      const sortedBookings = [...myBookings].sort((a, b) => (b.id || 0) - (a.id || 0));
      setBookings(sortedBookings);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      alert("Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return bookings.filter((booking) => {
      return (
        (booking.resourceName || "").toLowerCase().includes(search) ||
        (booking.bookingDate || "").toLowerCase().includes(search) ||
        (booking.bookingTime || "").toLowerCase().includes(search) ||
        (booking.status || "").toLowerCase().includes(search)
      );
    });
  }, [bookings, searchTerm]);

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const approvedCount = bookings.filter((b) => b.status === "APPROVED").length;
  const rejectedCount = bookings.filter((b) => b.status === "REJECTED").length;

  const getStatusIcon = (status) => {
    if (status === "APPROVED") return <FaCheckCircle />;
    if (status === "REJECTED") return <FaTimesCircle />;
    return <FaHourglassHalf />;
  };

  const getStatusClass = (status) => {
    if (status === "APPROVED") return "approved";
    if (status === "REJECTED") return "rejected";
    return "pending";
  };

  return (
    <div className="mybookings-page">
      <RegisteredNavbar />

      <div className="mybookings-page-overlay"></div>

      <div className="mybookings-shell">
        <section className="mybookings-hero">
          <div className="mybookings-hero-left">
            <div className="mybookings-chip">Booking Center</div>
            <h1>My Bookings</h1>
            <p>
              View all your submitted resource bookings and track whether they are
              pending, approved, or rejected by the admin.
            </p>
          </div>

          <div className="mybookings-hero-right">
            <div className="mybookings-stat-card">
              <div className="mybookings-stat-icon total">
                <FaCalendarCheck />
              </div>
              <div>
                <h3>{bookings.length}</h3>
                <p>Total Bookings</p>
              </div>
            </div>

            <div className="mybookings-stat-card">
              <div className="mybookings-stat-icon pending">
                <FaHourglassHalf />
              </div>
              <div>
                <h3>{pendingCount}</h3>
                <p>Pending</p>
              </div>
            </div>

            <div className="mybookings-stat-card">
              <div className="mybookings-stat-icon approved">
                <FaCheckCircle />
              </div>
              <div>
                <h3>{approvedCount}</h3>
                <p>Approved</p>
              </div>
            </div>

            <div className="mybookings-stat-card">
              <div className="mybookings-stat-icon rejected">
                <FaTimesCircle />
              </div>
              <div>
                <h3>{rejectedCount}</h3>
                <p>Rejected</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mybookings-filter-card">
          <div className="mybookings-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by resource, date, time, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        <section className="mybookings-list-card">
          <div className="mybookings-list-head">
            <h2>Your Booking Requests</h2>
            <span>{filteredBookings.length} records found</span>
          </div>

          {loading ? (
            <div className="mybookings-empty">
              <h3>Loading your bookings...</h3>
              <p>Please wait while your booking details are being loaded.</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="mybookings-empty">
              <div className="mybookings-empty-icon">
                <FaInbox />
              </div>
              <h3>No bookings found</h3>
              <p>
                You have not submitted any bookings yet, or your search did not
                match any results.
              </p>
            </div>
          ) : (
            <div className="mybookings-grid">
              {filteredBookings.map((booking) => (
                <div className="mybookings-card" key={booking.id}>
                  <div className="mybookings-card-top">
                    <div>
                      <h3>{booking.resourceName || "Unnamed Resource"}</h3>
                      <p>Booking ID: {booking.id}</p>
                    </div>

                    <span
                      className={`mybookings-status ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)}
                      {booking.status || "PENDING"}
                    </span>
                  </div>

                  <div className="mybookings-info-list">
                    <div className="mybookings-info-row">
                      <span>
                        <FaLayerGroup />
                        Resource
                      </span>
                      <strong>{booking.resourceName || "N/A"}</strong>
                    </div>

                    <div className="mybookings-info-row">
                      <span>
                        <FaCalendarCheck />
                        Date
                      </span>
                      <strong>{booking.bookingDate || "N/A"}</strong>
                    </div>

                    <div className="mybookings-info-row">
                      <span>
                        <FaClock />
                        Time
                      </span>
                      <strong>{booking.bookingTime || "N/A"}</strong>
                    </div>

                    <div className="mybookings-info-row">
                      <span>
                        <FaMapMarkerAlt />
                        Resource ID
                      </span>
                      <strong>{booking.resourceId || "N/A"}</strong>
                    </div>
                  </div>

                  <div className="mybookings-card-footer">
                    <div className={`mybookings-footer-note ${getStatusClass(booking.status)}`}>
                      {booking.status === "APPROVED" &&
                        "Your booking was approved by the admin."}
                      {booking.status === "REJECTED" &&
                        "Your booking was rejected. Please try another slot."}
                      {(!booking.status || booking.status === "PENDING") &&
                        "Your booking is waiting for admin review."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}