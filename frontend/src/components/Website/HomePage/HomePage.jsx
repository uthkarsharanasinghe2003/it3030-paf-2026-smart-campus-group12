import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";
import UnregisteredNavbar from "../Navbar/UnregisteredNavbar/UnregisteredNavbar";
import Footer from "../Footer/Footer";
import logo from "../../image/logo.png"; 

export default function HomePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handlePrimaryAction = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "ADMIN") {
      navigate("/admin/dashboard");
      return;
    }

    if (user.role === "TECHNICIAN") {
      navigate("/technician/dashboard");
      return;
    }

    navigate("/user/dashboard");
  };

  return (
    <>
      <UnregisteredNavbar />

      <div className="home-page">
        <section className="home-hero">
          <div className="home-hero-content">
            <div className="home-hero-badge">Smart Campus Operations</div>

            <h1>
              Manage bookings, resources, and maintenance with
              <span> Smart Campus Hub</span>
            </h1>

            <p>
              A modern platform for campus operations that helps users manage
              facilities, request bookings, report incidents, and stay updated
              with notifications in one place.
            </p>

            <div className="home-hero-actions">
              <button className="home-btn home-btn-primary" onClick={handlePrimaryAction}>
                {user ? "Go to Dashboard" : "Login Now"}
              </button>

              {!user && (
                <Link to="/register" className="home-btn home-btn-secondary">
                  Register
                </Link>
              )}
            </div>

            <div className="home-hero-stats">
              <div className="home-stat-card">
                <h3>Resources</h3>
                <span>Rooms, labs & equipment</span>
              </div>

              <div className="home-stat-card">
                <h3>Bookings</h3>
                <span>Fast and organized requests</span>
              </div>

              <div className="home-stat-card">
                <h3>Support</h3>
                <span>Tickets, updates & alerts</span>
              </div>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-visual-card">
              <img src={logo} alt="Smart Campus Hub Logo" className="home-visual-logo" />
              <h2>Smart Campus Hub</h2>
              <p>Secure, connected, and efficient campus service management.</p>

              <div className="home-visual-tags">
                <span>Booking</span>
                <span>Maintenance</span>
                <span>Notifications</span>
              </div>
            </div>
          </div>
        </section>

        <section className="home-quick-nav">
          <div className="home-section-head">
            <h2>Quick Navigation</h2>
            <p>Access the most important areas quickly.</p>
          </div>

          <div className="home-quick-grid">
            <Link to="/resources" className="home-quick-card">
              <h3>Browse Resources</h3>
              <p>View lecture halls, labs, rooms, and equipment.</p>
            </Link>

            <Link to="/login" className="home-quick-card">
              <h3>Request a Booking</h3>
              <p>Login and request facility or asset bookings easily.</p>
            </Link>

            <Link to="/login" className="home-quick-card">
              <h3>Report an Issue</h3>
              <p>Create maintenance and incident tickets with updates.</p>
            </Link>

            <Link to="/login" className="home-quick-card">
              <h3>Check Notifications</h3>
              <p>Stay updated on approvals, rejections, and ticket changes.</p>
            </Link>
          </div>
        </section>

        <section className="home-resources">
          <div className="home-section-head">
            <h2>Top Resources</h2>
            <p>Popular campus resources students and staff usually need.</p>
          </div>

          <div className="home-resource-grid">
            <div className="home-resource-card">
              <div className="home-resource-top">
                <span className="home-resource-badge">Lecture Hall</span>
                <span className="home-resource-status active">Available</span>
              </div>
              <h3>Main Auditorium</h3>
              <p>Large capacity hall suitable for seminars, workshops, and events.</p>
            </div>

            <div className="home-resource-card">
              <div className="home-resource-top">
                <span className="home-resource-badge">Computer Lab</span>
                <span className="home-resource-status active">Available</span>
              </div>
              <h3>Lab 03</h3>
              <p>Well-equipped lab space for practical sessions and assessments.</p>
            </div>

            <div className="home-resource-card">
              <div className="home-resource-top">
                <span className="home-resource-badge">Equipment</span>
                <span className="home-resource-status warning">Limited</span>
              </div>
              <h3>Projector Unit</h3>
              <p>Bookable projector with scheduled availability windows.</p>
            </div>
          </div>
        </section>

        <section className="home-announcements">
          <div className="home-section-head">
            <h2>Announcements</h2>
            <p>Latest campus service notices and important updates.</p>
          </div>

          <div className="home-announcement-list">
            <div className="home-announcement-card">
              <h3>System Upgrade Notice</h3>
              <p>
                Booking and ticket updates may be delayed during scheduled
                maintenance this weekend.
              </p>
            </div>

            <div className="home-announcement-card">
              <h3>New Resource Added</h3>
              <p>
                Additional smart classrooms are now available for booking from
                next week.
              </p>
            </div>

            <div className="home-announcement-card">
              <h3>Maintenance Reminder</h3>
              <p>
                Report campus incidents with image evidence for faster issue
                resolution.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}