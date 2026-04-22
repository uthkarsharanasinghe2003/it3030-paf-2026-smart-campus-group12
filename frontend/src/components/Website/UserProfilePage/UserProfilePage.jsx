import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RegisteredNavbar from "../Navbar/RegisteredNavbar/RegisteredNavbar";
import Footer from "../Footer/Footer";
import "./UserProfilePage.css";

const USER_API = "http://localhost:8081/api";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    fullName: storedUser?.fullName || "",
    email: storedUser?.email || "",
    role: storedUser?.role || "USER",
    active:
      storedUser?.active === undefined || storedUser?.active === null
        ? true
        : storedUser.active,
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const status = form.active ? "Active" : "Inactive";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        fullName: form.fullName,
        email: form.email,
        role: "USER",
        active: true,
      };

      const res = await axios.put(
        `${USER_API}/users/${storedUser?.id}`,
        payload
      );

      const updatedUser = res.data;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Profile updated successfully");
      window.location.reload();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(
        error?.response?.data ||
          error?.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await axios.patch(`${USER_API}/users/self-delete`, null, {
        params: {
          id: storedUser?.id || "",
          email: storedUser?.email || "",
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      alert("Your account has been deleted successfully.");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert(
        error?.response?.data ||
          error?.response?.data?.message ||
          "Failed to delete account"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <RegisteredNavbar />

      <div className="usrprofile-page">
        <div className="usrprofile-page-overlay"></div>

        <div className="usrprofile-shell">
          <section className="usrprofile-hero">
            <div className="usrprofile-hero-left">
              <span className="usrprofile-chip">Account Profile</span>
              <h1>My Profile</h1>
              <p>
                View and update your account details securely from one place.
              </p>
            </div>

            <div className="usrprofile-hero-card">
              <div className="usrprofile-avatar">
                {(form.fullName || "U").charAt(0).toUpperCase()}
              </div>
              <h3>{form.fullName || "User"}</h3>
              <p>{form.email || "Not available"}</p>
              <span className="usrprofile-status-badge">{status}</span>
            </div>
          </section>

          <section className="usrprofile-grid">
            <div className="usrprofile-card">
              <div className="usrprofile-card-head">
                <h2>Edit Personal Information</h2>
                <p>Keep your account details accurate and up to date.</p>
              </div>

              <form className="usrprofile-form" onSubmit={handleSaveProfile}>
                <div className="usrprofile-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="usrprofile-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="usrprofile-form-group">
                  <label>User Role</label>
                  <input type="text" value={form.role} disabled />
                </div>

                <div className="usrprofile-form-group">
                  <label>Account Status</label>
                  <input type="text" value={status} disabled />
                </div>

                <button
                  type="submit"
                  className="usrprofile-save-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>

            <div className="usrprofile-card">
              <div className="usrprofile-card-head">
                <h2>Profile Summary</h2>
                <p>Quick overview of your current account information.</p>
              </div>

              <div className="usrprofile-summary-box">
                <div className="usrprofile-summary-item">
                  <span>Role</span>
                  <h3>{form.role}</h3>
                </div>

                <div className="usrprofile-summary-item">
                  <span>Status</span>
                  <h3>{status}</h3>
                </div>

                <div className="usrprofile-summary-item">
                  <span>Email</span>
                  <h3 className="usrprofile-email-text">{form.email}</h3>
                </div>
              </div>
            </div>
          </section>

          <section className="usrprofile-danger-card">
            <div className="usrprofile-danger-head">
              <h2>Danger Zone</h2>
              <p>
                Permanently deactivate your account from the system. This action
                cannot be undone through the user side.
              </p>
            </div>

            <button
              type="button"
              className="usrprofile-delete-btn"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete My Account"}
            </button>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}