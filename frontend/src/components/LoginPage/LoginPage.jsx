import React from "react";
import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import GoogleAuthButton from "../../components/GoogleAuthButton/GoogleAuthButton";
import "./LoginPage.css";

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-shell">
        <Link to="/" className="login-close-btn" aria-label="Go to home page">
          <FaTimes />
        </Link>

        <div className="login-panel-left">
          <div className="login-top-chip">Welcome Back</div>

          <h1>Sign in to Continue</h1>
          <p>
            Access your account quickly and securely using Google Sign-In.
          </p>

          <div className="login-metric-grid">
            <div className="login-metric-card">
              <h3>Fast</h3>
              <span>One-click access</span>
            </div>

            <div className="login-metric-card">
              <h3>Safe</h3>
              <span>Google verified sign-in</span>
            </div>
          </div>
        </div>

        <div className="login-panel-right">
          <div className="login-header">
            <h2>Login with Google</h2>
            <p>Continue using your Google account</p>
          </div>

          <div className="login-divider">
            <span>use Google to continue</span>
          </div>

          <GoogleAuthButton mode="signin" />

          <p className="login-footer-text">
            Do not have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}