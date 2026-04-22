import React from "react";
import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import GoogleAuthButton from "../../components/GoogleAuthButton/GoogleAuthButton";
import "./RegisterPage.css";

export default function RegisterPage() {
  return (
    <div className="register-page">
      <div className="register-overlay"></div>

      <div className="register-card">
        <Link to="/" className="register-close-btn" aria-label="Go to home page">
          <FaTimes />
        </Link>

        <div className="register-left">
          <div className="register-brand-badge">Smart Access</div>
          <h1>Create Your Account</h1>
          <p>
            Register instantly with your Google account and continue securely.
          </p>

          <div className="register-feature-list">
            <div className="register-feature-item">
              <span></span>
              Fast account creation
            </div>
            <div className="register-feature-item">
              <span></span>
              Secure Google sign-up
            </div>
            <div className="register-feature-item">
              <span></span>
              Clean and simple experience
            </div>
          </div>
        </div>

        <div className="register-right">
          <div className="register-form-top">
            <h2>Register with Google</h2>
            <p>Continue using your Google account</p>
          </div>

          <GoogleAuthButton mode="signup" />

          <p className="register-bottom-text">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}