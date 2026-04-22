import React from "react";
import { Link } from "react-router-dom";
import "./UnregisteredNavbar.css";
import logo from "../../../image/logo.png";

export default function UnregisteredNavbar() {
  return (
    <nav className="guest-navbar">
      <div className="guest-navbar-container">
        <Link to="/" className="guest-brand">
          <img src={logo} alt="Smart Campus Hub Logo" className="guest-brand-logo" />
          <span className="guest-brand-text">Smart Campus</span>
        </Link>

        <div className="guest-nav-links">
          <Link to="/" className="guest-nav-link">Home</Link>
          <Link to="/resources" className="guest-nav-link">Resources</Link>
          <Link to="/about" className="guest-nav-link">About</Link>
          <Link to="/contact" className="guest-nav-link">Contact</Link>
        </div>

        <div className="guest-nav-actions">
          <Link to="/login" className="guest-btn guest-btn-outline">Login</Link>
          <Link to="/register" className="guest-btn guest-btn-accent">Register</Link>
        </div>
      </div>
    </nav>
  );
}