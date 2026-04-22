/* global window */
import React, { useEffect, useRef } from "react";
import axios from "axios";
import "./GoogleAuthButton.css";

const API_BASE = "http://localhost:8081";
const GOOGLE_CLIENT_ID =
  "593429197689-n7v0sfn3ul5mff6334pkveoh3oum5tja.apps.googleusercontent.com";

export default function GoogleAuthButton({ mode = "signin" }) {
  const googleButtonRef = useRef(null);

  const getRedirectPathByRole = (role) => {
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "TECHNICIAN") return "/technician/dashboard";
    return "/user/dashboard";
  };

  const handleCredentialResponse = async (response) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/google`, {
        credential: response.credential,
      });

      const savedUser = res.data;
      const redirectPath = getRedirectPathByRole(savedUser.role);

      localStorage.setItem("user", JSON.stringify(savedUser));

      alert(
        mode === "signup"
          ? "Google sign up successful"
          : "Google sign in successful"
      );

      window.location.href = redirectPath;
    } catch (error) {
      console.error("Google sign in failed:", error);
      alert(error?.response?.data || "Google sign in failed");
    }
  };

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: mode === "signup" ? "signup_with" : "signin_with",
        shape: "pill",
        width: 320,
      });
    };

    const existingScript = document.getElementById("google-gsi-script");

    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-gsi-script";
    script.onload = initializeGoogle;
    document.body.appendChild(script);
  }, [mode]);

  return (
    <div className="google-auth-wrap">
      <div ref={googleButtonRef}></div>
    </div>
  );
}