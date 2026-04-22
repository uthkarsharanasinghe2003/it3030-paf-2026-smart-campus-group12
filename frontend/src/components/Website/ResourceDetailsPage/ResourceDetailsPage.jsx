import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "./ResourceDetailsPage.css";
import RegisteredNavbar from "../../Website/Navbar/RegisteredNavbar/RegisteredNavbar";
import UnregisteredNavbar from "../../Website/Navbar/UnregisteredNavbar/UnregisteredNavbar";
import Footer from "../../Website/Footer/Footer";
import logo from "../../image/logo.png";

const RESOURCE_API = "http://localhost:8081/api/resources";
const BOOKING_API = "http://localhost:8081/api/bookings";

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingSaving, setBookingSaving] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  useEffect(() => {
    fetchResourceById();
    fetchBookingsByResource();
  }, [id]);

  const fetchResourceById = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${RESOURCE_API}/${id}`);
      setResource(res.data || null);
    } catch (error) {
      console.error("Failed to fetch resource details:", error);
      setResource(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsByResource = async () => {
    try {
      const res = await axios.get(`${BOOKING_API}/resource/${id}`);
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    }
  };

  const availableTimeSlots = useMemo(() => {
    if (!resource) return [];
    return [resource.slot1, resource.slot2, resource.slot3].filter(Boolean);
  }, [resource]);

  const equipmentList = useMemo(() => {
    if (!resource?.equipment) return [];
    return resource.equipment
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [resource]);

  const bookedTimesForSelectedDate = useMemo(() => {
    if (!selectedDate || !bookings.length) return [];

    return bookings
      .filter(
        (slot) =>
          slot.bookingDate === selectedDate &&
          (slot.status === "PENDING" || slot.status === "APPROVED")
      )
      .map((slot) => slot.bookingTime);
  }, [bookings, selectedDate]);

  const handleSlotClick = (slot) => {
    if (bookedTimesForSelectedDate.includes(slot)) return;
    setSelectedSlot(slot);
  };

  const handleBookNow = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (!selectedDate) {
      alert("Please select a booking date");
      return;
    }

    if (!selectedSlot) {
      alert("Please select a time slot");
      return;
    }

    try {
      setBookingSaving(true);

      const payload = {
        resourceId: resource.id,
        resourceName: resource.name,
        resourceImage: resource.image || "",
        userId: user.id,
        userName: user.fullName || user.name || "User",
        userEmail: user.email || "",
        bookingDate: selectedDate,
        bookingTime: selectedSlot,
        status: "PENDING",
      };

      await axios.post(BOOKING_API, payload);

      alert("Booking request submitted successfully");

      setSelectedDate("");
      setSelectedSlot("");
      fetchBookingsByResource();
    } catch (error) {
      console.error("Booking save failed:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to save booking"
      );
    } finally {
      setBookingSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        {user ? <RegisteredNavbar /> : <UnregisteredNavbar />}
        <div className="resource-details-page">
          <div className="resource-details-page-overlay"></div>
          <div className="resource-details-container">
            <div className="resource-details-empty">
              <h2>Loading resource...</h2>
              <p>Please wait while the resource details are being loaded.</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!resource) {
    return (
      <>
        {user ? <RegisteredNavbar /> : <UnregisteredNavbar />}
        <div className="resource-details-page">
          <div className="resource-details-page-overlay"></div>
          <div className="resource-details-container">
            <div className="resource-details-empty">
              <h2>Resource not found</h2>
              <p>The requested resource could not be found.</p>
              <Link to="/resources" className="resource-details-back-btn">
                Back to Resources
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {user ? <RegisteredNavbar /> : <UnregisteredNavbar />}

      <div className="resource-details-page">
        <div className="resource-details-page-overlay"></div>

        <div className="resource-details-container">
          <section className="resource-details-topbar">
            <Link to="/resources" className="resource-details-back-btn">
              ← Back to Resources
            </Link>
          </section>

          <section className="resource-details-hero">
            <div className="resource-details-image-card">
              {resource.image ? (
                <img
                  src={resource.image}
                  alt={resource.name}
                  className="resource-details-main-image"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="resource-details-image-placeholder">
                  <img src={logo} alt="Smart Campus Hub" />
                  <span>{resource.type}</span>
                </div>
              )}
            </div>

            <div className="resource-details-main-card">
              <div className="resource-details-badges">
                <span className="resource-details-type-badge">{resource.type}</span>
                <span
                  className={`resource-details-status-badge ${
                    resource.status === "ACTIVE" ? "active" : "out-of-service"
                  }`}
                >
                  {resource.status}
                </span>
              </div>

              <h1>{resource.name}</h1>
              <p className="resource-details-description">{resource.description}</p>

              {!user && (
                <div className="resource-details-guest-note">
                  <strong>Guest Access:</strong> You can view resource details now.
                  Login to request a booking or report an issue.
                </div>
              )}

              <div className="resource-details-action-row">
                {user ? (
                  <>
                    <button
                      type="button"
                      className="resource-details-book-btn"
                      onClick={handleBookNow}
                      disabled={bookingSaving}
                    >
                      {bookingSaving ? "Saving..." : "Book Now"}
                    </button>

                    <Link
                      to="/create-ticket"
                      state={{
                        resourceId: resource.id,
                        resourceName: resource.name,
                        resourceLocation: resource.location,
                        resourceType: resource.type,
                        resourceDescription: resource.description,
                      }}
                      className="resource-details-report-btn"
                    >
                      Report Issue
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="resource-details-book-btn">
                      Login to Book
                    </Link>
                    <Link to="/login" className="resource-details-report-btn guest-mode">
                      Login to Report
                    </Link>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="resource-details-info-grid">
            <div className="resource-details-info-card">
              <h2>Resource Information</h2>

              <div className="resource-details-list">
                <div className="resource-details-row">
                  <span>Resource Name</span>
                  <strong>{resource.name}</strong>
                </div>

                <div className="resource-details-row">
                  <span>Category</span>
                  <strong>{resource.type}</strong>
                </div>

                <div className="resource-details-row">
                  <span>Capacity</span>
                  <strong>{resource.capacity}</strong>
                </div>

                <div className="resource-details-row">
                  <span>Location</span>
                  <strong>{resource.location}</strong>
                </div>

                <div className="resource-details-row">
                  <span>Availability Window</span>
                  <strong>{resource.availability}</strong>
                </div>

                <div className="resource-details-row">
                  <span>Status</span>
                  <strong>{resource.status}</strong>
                </div>
              </div>
            </div>

            <div className="resource-details-info-card">
              <h2>Available Equipment</h2>

              {equipmentList.length > 0 ? (
                <div className="resource-details-feature-list">
                  {equipmentList.map((feature, index) => (
                    <div className="resource-details-feature-item" key={index}>
                      <span>•</span>
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="resource-details-slot-empty">
                  <h3>No equipment listed</h3>
                  <p>This resource does not have extra equipment listed right now.</p>
                </div>
              )}
            </div>
          </section>

          <section className="resource-details-select-card">
            <div className="resource-details-select-head">
              <h2>Select Booking Date and Time</h2>
              <span>{availableTimeSlots.length} Time Slots</span>
            </div>

            <div className="resource-details-date-picker">
              <label>Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot("");
                }}
              />
            </div>

            <div className="resource-details-time-section">
              <h3>Available Time Slots</h3>
              <div className="resource-details-time-grid">
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map((slot, index) => {
                    const isBooked = bookedTimesForSelectedDate.includes(slot);
                    const isSelected = selectedSlot === slot;

                    return (
                      <button
                        key={index}
                        type="button"
                        className={`resource-details-time-btn ${
                          isBooked ? "booked" : ""
                        } ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSlotClick(slot)}
                        disabled={!selectedDate || isBooked}
                      >
                        {isBooked ? `${slot} - Booked` : slot}
                      </button>
                    );
                  })
                ) : (
                  <p>No time slots available for this resource.</p>
                )}
              </div>
            </div>

            {selectedDate && selectedSlot && (
              <div className="resource-details-selection-preview">
                <h3>Selected Booking Slot</h3>
                <p>
                  <strong>Date:</strong> {selectedDate}
                </p>
                <p>
                  <strong>Time:</strong> {selectedSlot}
                </p>
              </div>
            )}
          </section>

          <section className="resource-details-slots-card">
            <div className="resource-details-slots-head">
              <h2>Upcoming Booked Slots</h2>
              <span>Unavailable Times</span>
            </div>

            {bookings.length > 0 ? (
              <div className="resource-details-slots-list">
                {bookings
                  .filter(
                    (slot) =>
                      slot.status === "PENDING" || slot.status === "APPROVED"
                  )
                  .map((slot, index) => (
                    <div className="resource-details-slot-item" key={index}>
                      <div className="resource-details-slot-left">
                        <h3>{slot.bookingDate}</h3>
                        <p>{slot.bookingTime}</p>
                      </div>

                      <span
                        className={`resource-details-slot-badge ${
                          slot.status === "APPROVED" ? "approved" : "pending"
                        }`}
                      >
                        {slot.status}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="resource-details-slot-empty">
                <h3>No upcoming bookings</h3>
                <p>This resource does not have any reserved upcoming time slots right now.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}