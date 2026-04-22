import React, { useState } from "react";
import "./ContactUs.css";
import UnregisteredNavbar from "../Navbar/UnregisteredNavbar/UnregisteredNavbar";
import Footer from "../Footer/Footer";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your message has been submitted successfully.");
    setFormData({
      fullName: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <>
      <UnregisteredNavbar />

      <div className="contact-page">
        <div className="contact-page-overlay"></div>

        <section className="contact-hero">
          <div className="contact-hero-text">
            <div className="contact-chip">Contact Smart Campus Hub</div>
            <h1>We are here to help and support your campus experience</h1>
            <p>
              Reach out to us for questions, feedback, or technical assistance.
              Our team is ready to help you with bookings, resources, incident
              reporting, and general platform support.
            </p>

            <div className="contact-hero-mini-stats">
              <div className="contact-mini-stat">
                <h4>24/7</h4>
                <span>Support Visibility</span>
              </div>
              <div className="contact-mini-stat">
                <h4>Fast</h4>
                <span>Response Flow</span>
              </div>
              <div className="contact-mini-stat">
                <h4>Secure</h4>
                <span>User Assistance</span>
              </div>
            </div>
          </div>

          <div className="contact-info-panel">
            <div className="contact-info-card">
              <div className="contact-info-icon">✉</div>
              <div>
                <h3>Email</h3>
                <p>support@smartcampushub.com</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">☎</div>
              <div>
                <h3>Phone</h3>
                <p>+94 71 234 5678</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">⌂</div>
              <div>
                <h3>Location</h3>
                <p>Smart Campus Operations Center, Sri Lanka</p>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-form-section">
          <div className="contact-form-wrap">
            <div className="contact-form-head">
              <div>
                <h2>Send Us a Message</h2>
                <p>
                  Fill in your details and we will get back to you as soon as possible.
                </p>
              </div>

              <div className="contact-form-badge">Campus Support</div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-grid">
                <div className="contact-input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="contact-input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="contact-input-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter subject"
                  required
                />
              </div>

              <div className="contact-input-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Write your message here"
                  required
                ></textarea>
              </div>

              <button type="submit" className="contact-submit-btn">
                Send Message
              </button>
            </form>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}