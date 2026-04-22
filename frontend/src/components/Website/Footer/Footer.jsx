import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import logo from "../../image/logo.png";

export default function Footer() {
  return (
    <footer className="campus-footer">
      <div className="campus-footer-overlay"></div>

      <div className="campus-footer-container">
        <div className="campus-footer-top">
          <div className="campus-footer-brand-block">
            <div className="campus-footer-brand">
              <img
                src={logo}
                alt="Smart Campus Hub Logo"
                className="campus-footer-logo"
              />
              <div className="campus-footer-brand-text-wrap">
                <h2 className="campus-footer-brand-title">Smart Campus Hub</h2>
                <p className="campus-footer-brand-subtitle">
                  Smart booking, maintenance, and campus operations in one place.
                </p>
              </div>
            </div>

            <div className="campus-footer-highlight-card">
              <span className="campus-footer-highlight-badge">Campus Services</span>
              <h3>One platform for bookings, support, and operations</h3>
              <p>
                Manage resources, report incidents, and stay updated with smart
                notifications through a clean connected campus system.
              </p>
            </div>
          </div>

          <div className="campus-footer-links-grid">
            <div className="campus-footer-column">
              <h3>Quick Links</h3>
              <Link to="/">Home</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>

            <div className="campus-footer-column">
              <h3>Modules</h3>
              <Link to="/resources">Resources</Link>
              <Link to="/my-bookings">Bookings</Link>
              <Link to="/my-tickets">Tickets</Link>
            </div>

            <div className="campus-footer-column">
              <h3>Support</h3>
              <Link to="/notifications">Notifications</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>

        <div className="campus-footer-divider"></div>

        <div className="campus-footer-bottom">
          <p>© 2026 Smart Campus Hub. All rights reserved.</p>
          <div className="campus-footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}