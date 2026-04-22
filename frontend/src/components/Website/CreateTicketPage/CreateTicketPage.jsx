import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import RegisteredNavbar from "../Navbar/RegisteredNavbar/RegisteredNavbar";
import Footer from "../Footer/Footer";
import "./CreateTicketPage.css";

const API_BASE = "http://localhost:8081/api/tickets";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedResource = location.state || {};
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    category: "",
    resourceLocation: "",
    description: "",
    priority: "MEDIUM",
    contactName: user?.fullName || user?.name || "",
    contactEmail: user?.email || "",
    contactPhone: "",
  });

  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedResource?.resourceName || selectedResource?.resourceLocation) {
      setForm((prev) => ({
        ...prev,
        category: prev.category || "Facility Damage",
        resourceLocation:
          `${selectedResource.resourceName || ""}${
            selectedResource.resourceLocation
              ? ` - ${selectedResource.resourceLocation}`
              : ""
          }`,
        description:
          prev.description ||
          `Issue related to ${selectedResource.resourceName || "selected resource"}.${
            selectedResource.resourceDescription
              ? ` Resource details: ${selectedResource.resourceDescription}`
              : ""
          }\n\nPlease describe the problem clearly here.`,
      }));
    }
  }, [selectedResource]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 3) {
      alert("You can upload up to 3 images only");
      return;
    }
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("userId", user?.id || "");
      payload.append("userName", user?.fullName || user?.name || "User");
      payload.append("userEmail", user?.email || "");
      payload.append("category", form.category);
      payload.append("resourceLocation", form.resourceLocation);
      payload.append("description", form.description);
      payload.append("priority", form.priority);
      payload.append("contactName", form.contactName);
      payload.append("contactEmail", form.contactEmail);
      payload.append("contactPhone", form.contactPhone);

      files.forEach((file) => payload.append("files", file));

      await axios.post(`${API_BASE}/create`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Ticket submitted successfully");
      navigate("/my-tickets");
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to submit ticket"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <RegisteredNavbar />

      <div className="ticket-create-page">
        <div className="ticket-create-page-overlay"></div>

        <div className="ticket-create-shell">
          <div className="ticket-create-header">
            <div className="ticket-create-chip">Support Ticket</div>
            <h1>Submit New Ticket</h1>
            <p>Report issues related to campus resources and facilities.</p>
          </div>

          {selectedResource?.resourceName && (
            <div className="ticket-prefill-box">
              <div className="ticket-prefill-head">
                <h3>Selected Resource</h3>
                <span>Auto Filled</span>
              </div>

              <div className="ticket-prefill-grid">
                <p>
                  <strong>Name:</strong> {selectedResource.resourceName}
                </p>
                <p>
                  <strong>Location:</strong> {selectedResource.resourceLocation || "N/A"}
                </p>
                <p>
                  <strong>Type:</strong> {selectedResource.resourceType || "N/A"}
                </p>
              </div>
            </div>
          )}

          <form className="ticket-create-form" onSubmit={handleSubmit}>
            <div className="ticket-form-head">
              <h2>Ticket Information</h2>
              <p>Fill in the details below to submit your maintenance or support request.</p>
            </div>

            <div className="ticket-create-grid">
              <div className="ticket-field">
                <label>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Equipment Issue">Equipment Issue</option>
                  <option value="Facility Damage">Facility Damage</option>
                  <option value="Electrical Issue">Electrical Issue</option>
                  <option value="Cleaning Issue">Cleaning Issue</option>
                  <option value="Booking Issue">Booking Issue</option>
                </select>
              </div>

              <div className="ticket-field">
                <label>Resource / Location</label>
                <input
                  type="text"
                  name="resourceLocation"
                  value={form.resourceLocation}
                  onChange={handleChange}
                  placeholder="Resource name and location"
                  required
                />
              </div>

              <div className="ticket-field">
                <label>Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div className="ticket-field">
                <label>Contact Name</label>
                <input
                  type="text"
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ticket-field">
                <label>Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ticket-field">
                <label>Contact Phone</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  placeholder="07XXXXXXXX"
                />
              </div>
            </div>

            <div className="ticket-field full">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="7"
                placeholder="Describe the issue clearly"
                required
              ></textarea>
            </div>

            <div className="ticket-field full">
              <label>Image Attachments (Up to 3)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </div>

            <button
              type="submit"
              className="ticket-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}