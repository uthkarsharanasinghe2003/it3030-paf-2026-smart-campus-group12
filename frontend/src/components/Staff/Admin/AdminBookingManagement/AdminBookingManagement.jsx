import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaDoorOpen,
  FaUser,
  FaEnvelope,
  FaImage,
} from "react-icons/fa";
import AdminLayout from "../AdminLayout/AdminLayout";
import "./AdminBookingManagement.css";

const API_BASE = "http://localhost:8081/api/bookings";

export default function AdminBookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      alert("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        (booking.resourceName || "").toLowerCase().includes(search) ||
        (booking.userName || "").toLowerCase().includes(search) ||
        (booking.userEmail || "").toLowerCase().includes(search) ||
        (booking.bookingDate || "").toLowerCase().includes(search) ||
        (booking.bookingTime || "").toLowerCase().includes(search) ||
        (booking.status || "").toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const approvedCount = bookings.filter((b) => b.status === "APPROVED").length;
  const rejectedCount = bookings.filter((b) => b.status === "REJECTED").length;

  const updateBookingStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await axios.patch(`${API_BASE}/${id}/status`, { status });
      alert(`Booking ${status.toLowerCase()} successfully`);
      setBookings((prev) => prev.filter((booking) => booking.id !== id));
    } catch (error) {
      console.error("Failed to update booking status:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to update booking status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout activeTab="bookings">
      <div className="admin-booking-page">
        <div className="admin-booking-page-overlay"></div>

        <div className="admin-booking-shell">
          <section className="admin-booking-hero">
            <div className="admin-booking-hero-left">
              <div className="admin-booking-chip">Booking Control</div>
              <h1>Manage all resource booking requests</h1>
              <p>
                Review submitted booking requests, approve valid reservations,
                reject unavailable requests, and keep booking flow organized.
              </p>
            </div>

            <div className="admin-booking-hero-right">
              <div className="admin-booking-stat-card">
                <div className="admin-booking-stat-icon pending">
                  <FaClock />
                </div>
                <div>
                  <h3>{pendingCount}</h3>
                  <p>Pending</p>
                </div>
              </div>

              <div className="admin-booking-stat-card">
                <div className="admin-booking-stat-icon approved">
                  <FaCheckCircle />
                </div>
                <div>
                  <h3>{approvedCount}</h3>
                  <p>Approved</p>
                </div>
              </div>

              <div className="admin-booking-stat-card">
                <div className="admin-booking-stat-icon rejected">
                  <FaTimesCircle />
                </div>
                <div>
                  <h3>{rejectedCount}</h3>
                  <p>Rejected</p>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-booking-filter-card">
            <div className="admin-booking-filter-head">
              <h2>Search and Filter</h2>
            </div>

            <div className="admin-booking-filter-grid">
              <div className="admin-booking-search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search by resource, user, email, date, time..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="admin-booking-select-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="All">All Status</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>
          </section>

          <section className="admin-booking-list-card">
            <div className="admin-booking-list-head">
              <h2>Booking Requests</h2>
              <span>{filteredBookings.length} records found</span>
            </div>

            {loading ? (
              <div className="admin-booking-empty">
                <h3>Loading bookings...</h3>
                <p>Please wait while booking requests are being loaded.</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="admin-booking-empty">
                <h3>No bookings found</h3>
                <p>No pending booking requests available right now.</p>
              </div>
            ) : (
              <div className="admin-booking-grid">
                {filteredBookings.map((booking) => (
                  <div className="admin-booking-card" key={booking.id}>
                    <div className="admin-booking-image-wrap">
                      {booking.resourceImage ? (
                        <img
                          src={booking.resourceImage}
                          alt={booking.resourceName}
                          className="admin-booking-image"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/500x240?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="admin-booking-image-placeholder">
                          <FaImage />
                          <span>No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="admin-booking-card-top">
                      <div>
                        <h3>{booking.resourceName}</h3>
                        <p>Booking ID: {booking.id}</p>
                      </div>

                      <span
                        className={`admin-booking-status ${
                          booking.status === "APPROVED"
                            ? "approved"
                            : booking.status === "REJECTED"
                            ? "rejected"
                            : "pending"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="admin-booking-info-list">
                      <div className="admin-booking-info-row">
                        <span>
                          <FaUser />
                          User
                        </span>
                        <strong>{booking.userName || "N/A"}</strong>
                      </div>

                      <div className="admin-booking-info-row">
                        <span>
                          <FaEnvelope />
                          Email
                        </span>
                        <strong>{booking.userEmail || "N/A"}</strong>
                      </div>

                      <div className="admin-booking-info-row">
                        <span>
                          <FaCalendarAlt />
                          Date
                        </span>
                        <strong>{booking.bookingDate}</strong>
                      </div>

                      <div className="admin-booking-info-row">
                        <span>
                          <FaClock />
                          Time
                        </span>
                        <strong>{booking.bookingTime}</strong>
                      </div>

                      <div className="admin-booking-info-row">
                        <span>
                          <FaDoorOpen />
                          Resource ID
                        </span>
                        <strong>{booking.resourceId}</strong>
                      </div>
                    </div>

                    <div className="admin-booking-action-row">
                      <button
                        type="button"
                        className="admin-booking-approve-btn"
                        onClick={() =>
                          updateBookingStatus(booking.id, "APPROVED")
                        }
                        disabled={
                          updatingId === booking.id ||
                          booking.status === "APPROVED"
                        }
                      >
                        <FaCheckCircle />
                        {updatingId === booking.id ? "Updating..." : "Approve"}
                      </button>

                      <button
                        type="button"
                        className="admin-booking-reject-btn"
                        onClick={() =>
                          updateBookingStatus(booking.id, "REJECTED")
                        }
                        disabled={
                          updatingId === booking.id ||
                          booking.status === "REJECTED"
                        }
                      >
                        <FaTimesCircle />
                        {updatingId === booking.id ? "Updating..." : "Reject"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}