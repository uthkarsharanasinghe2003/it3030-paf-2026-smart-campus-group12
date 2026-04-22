import React from "react";
import "./AboutUs.css";
import UnregisteredNavbar from "../Navbar/UnregisteredNavbar/UnregisteredNavbar";
import Footer from "../Footer/Footer";
import logo from "../../image/logo.png";

export default function AboutUs() {
  return (
    <>
      <UnregisteredNavbar />

      <div className="about-page">
        <div className="about-page-overlay"></div>

        <section className="about-hero">
          <div className="about-hero-text">
            <div className="about-chip">About Smart Campus Hub</div>
            <h1>Building a smarter and more connected campus experience</h1>
            <p>
              Smart Campus Hub is a modern web platform designed to simplify
              campus operations by bringing resource booking, maintenance
              reporting, notifications, and service updates into one secure and
              user-friendly system.
            </p>

            <div className="about-hero-mini-stats">
              <div className="about-mini-stat">
                <h4>01</h4>
                <span>Integrated Platform</span>
              </div>
              <div className="about-mini-stat">
                <h4>24/7</h4>
                <span>Service Visibility</span>
              </div>
              <div className="about-mini-stat">
                <h4>100%</h4>
                <span>Role-Based Access</span>
              </div>
            </div>
          </div>

          <div className="about-hero-card">
            <div className="about-hero-card-badge">Campus Operations</div>
            <img src={logo} alt="Smart Campus Hub Logo" className="about-logo" />
            <h2>Smart Campus Hub</h2>
            <p>
              One platform for bookings, incident tracking, and real-time campus
              communication.
            </p>

            <div className="about-hero-tags">
              <span>Bookings</span>
              <span>Tickets</span>
              <span>Notifications</span>
            </div>
          </div>
        </section>

        <section className="about-info-section">
          <div className="about-section-head">
            <h2>Who We Are</h2>
            <p>Improving efficiency, visibility, and convenience across campus services.</p>
          </div>

          <div className="about-info-grid">
            <div className="about-info-card">
              <div className="about-info-icon">M</div>
              <h3>Our Mission</h3>
              <p>
                To provide a centralized and reliable platform that helps
                students, staff, and administrators manage campus resources and
                support services with ease.
              </p>
            </div>

            <div className="about-info-card">
              <div className="about-info-icon">V</div>
              <h3>Our Vision</h3>
              <p>
                To create a more organized, responsive, and technology-driven
                campus environment where every service is accessible in one
                place.
              </p>
            </div>

            <div className="about-info-card">
              <div className="about-info-icon">S</div>
              <h3>What We Offer</h3>
              <p>
                Facility booking, asset tracking, ticket management,
                notifications, and role-based access for a smooth campus
                workflow.
              </p>
            </div>
          </div>
        </section>

        <section className="about-feature-section">
          <div className="about-section-head">
            <h2>Why Choose Our Platform</h2>
            <p>Designed for usability, transparency, and modern campus operations.</p>
          </div>

          <div className="about-feature-grid">
            <div className="about-feature-card">
              <span>01</span>
              <h3>Easy Resource Booking</h3>
              <p>Quickly browse, search, and reserve rooms, labs, and equipment.</p>
            </div>

            <div className="about-feature-card">
              <span>02</span>
              <h3>Smart Maintenance Tracking</h3>
              <p>Report issues, track progress, and receive updates with clarity.</p>
            </div>

            <div className="about-feature-card">
              <span>03</span>
              <h3>Real-Time Notifications</h3>
              <p>Stay informed about approvals, rejections, and ticket changes instantly.</p>
            </div>

            <div className="about-feature-card">
              <span>04</span>
              <h3>Role-Based Access</h3>
              <p>Secure dashboards for users, technicians, and administrators.</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}