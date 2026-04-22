import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaEdit,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTools,
  FaTrash,
  FaUserCheck,
  FaUserShield,
  FaUserTie,
  FaGoogle,
} from "react-icons/fa";
import AdminLayout from "../AdminLayout/AdminLayout";
import "./AdminStaffManagement.css";

const API_BASE = "http://localhost:8081/api/staff";

const initialForm = {
  fullName: "",
  email: "",
  role: "TECHNICIAN",
  active: true,
};

export default function AdminStaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setStaff(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load staff:", error);
      alert("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return staff.filter((member) => {
      return (
        (member.fullName || "").toLowerCase().includes(search) ||
        (member.email || "").toLowerCase().includes(search) ||
        (member.role || "").toLowerCase().includes(search) ||
        (member.authProvider || "").toLowerCase().includes(search)
      );
    });
  }, [staff, searchTerm]);

  const adminCount = staff.filter((s) => s.role === "ADMIN").length;
  const technicianCount = staff.filter((s) => s.role === "TECHNICIAN").length;

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingStaffId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setIsEditMode(true);
    setEditingStaffId(member.id);
    setFormData({
      fullName: member.fullName || "",
      email: member.email || "",
      role: member.role || "TECHNICIAN",
      active: member.active && !member.deleted,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setIsEditMode(false);
    setEditingStaffId(null);
    setFormData(initialForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      alert("Full name is required");
      return false;
    }

    if (!formData.email.trim()) {
      alert("Email is required");
      return false;
    }

    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert("Enter a valid email");
      return false;
    }

    if (!["ADMIN", "TECHNICIAN"].includes(formData.role)) {
      alert("Role must be ADMIN or TECHNICIAN");
      return false;
    }

    return true;
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        active: formData.active,
      };

      if (isEditMode) {
        await axios.put(`${API_BASE}/${editingStaffId}`, payload);
        alert("Staff updated successfully");
      } else {
        await axios.post(API_BASE, payload);
        alert("Staff created successfully");
      }

      closeModal();
      fetchStaff();
    } catch (error) {
      console.error("Save staff failed:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to save staff"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this staff account?"
    );
    if (!confirmed) return;

    try {
      setUpdatingId(id);
      await axios.patch(`${API_BASE}/${id}/deactivate`);
      alert("Staff deactivated successfully");
      fetchStaff();
    } catch (error) {
      console.error("Deactivate failed:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to deactivate staff"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleActivate = async (id) => {
    try {
      setUpdatingId(id);
      await axios.patch(`${API_BASE}/${id}/activate`);
      alert("Staff activated successfully");
      fetchStaff();
    } catch (error) {
      console.error("Activate failed:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to activate staff"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout activeTab="staff">
      <div className="admin-staff-page">
        <div className="admin-staff-page-overlay"></div>

        <div className="admin-staff-shell">
          <section className="admin-staff-hero">
            <div className="admin-staff-hero-left">
              <div className="admin-staff-chip">Staff Directory</div>
              <h1>Manage staff accounts</h1>
              <p>
                Add, edit, and control ADMIN and TECHNICIAN accounts from one
                place.
              </p>

              <div className="admin-staff-hero-actions">
                <button
                  type="button"
                  className="admin-staff-add-btn"
                  onClick={openAddModal}
                >
                  <FaPlus />
                  Add Staff
                </button>
              </div>
            </div>

            <div className="admin-staff-hero-right">
              <div className="admin-staff-stat-card">
                <div className="admin-staff-stat-icon admin">
                  <FaUserTie />
                </div>
                <div>
                  <h3>{adminCount}</h3>
                  <p>Admins</p>
                </div>
              </div>

              <div className="admin-staff-stat-card">
                <div className="admin-staff-stat-icon tech">
                  <FaTools />
                </div>
                <div>
                  <h3>{technicianCount}</h3>
                  <p>Technicians</p>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-staff-filter-card">
            <div className="admin-staff-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search by name, email, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </section>

          <section className="admin-staff-list-card">
            <div className="admin-staff-list-head">
              <h2>Staff Members</h2>
              <span>{filteredStaff.length} records found</span>
            </div>

            {loading ? (
              <div className="admin-staff-empty">
                <h3>Loading staff...</h3>
                <p>Please wait while staff accounts are being loaded.</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="admin-staff-empty">
                <h3>No staff found</h3>
                <p>Try another search.</p>
              </div>
            ) : (
              <div className="admin-staff-grid">
                {filteredStaff.map((member) => {
                  const isActive = member.active && !member.deleted;
                  const isLinked = !!member.googleId;

                  return (
                    <div className="admin-staff-card" key={member.id}>
                      <div className="admin-staff-card-top">
                        <div className="admin-staff-avatar">
                          <FaUserShield />
                        </div>
                        <div className="admin-staff-card-title">
                          <h3>{member.fullName || "Unnamed Staff"}</h3>
                          <p>{member.email}</p>
                        </div>
                      </div>

                      <div className="admin-staff-badge-row">
                        <span
                          className={`admin-staff-badge ${
                            isActive ? "active" : "blocked"
                          }`}
                        >
                          {isActive ? "Active" : "Blocked"}
                        </span>

                        <span
                          className={`admin-staff-badge ${
                            isLinked ? "linked" : "pending"
                          }`}
                        >
                          <FaGoogle />
                          {isLinked ? "Google Linked" : "Pending Login"}
                        </span>
                      </div>

                      <div className="admin-staff-info-list">
                        <div className="admin-staff-info-row">
                          <span>Staff ID</span>
                          <strong>{member.id}</strong>
                        </div>

                        <div className="admin-staff-info-row">
                          <span>Role</span>
                          <strong className="admin-staff-role">
                            {member.role}
                          </strong>
                        </div>

                        <div className="admin-staff-info-row">
                          <span>Provider</span>
                          <strong>{member.authProvider || "GOOGLE"}</strong>
                        </div>

                        <div className="admin-staff-info-row">
                          <span>Google Account</span>
                          <strong>
                            {isLinked ? "Linked" : "Not linked yet"}
                          </strong>
                        </div>
                      </div>

                      <div className="admin-staff-action-row multi">
                        <button
                          type="button"
                          className="admin-staff-edit-btn"
                          onClick={() => openEditModal(member)}
                        >
                          <FaEdit />
                          Edit
                        </button>

                        {isActive ? (
                          <button
                            type="button"
                            className="admin-staff-delete-btn"
                            onClick={() => handleDeactivate(member.id)}
                            disabled={updatingId === member.id}
                          >
                            <FaTrash />
                            {updatingId === member.id
                              ? "Updating..."
                              : "Deactivate"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-staff-activate-btn"
                            onClick={() => handleActivate(member.id)}
                            disabled={updatingId === member.id}
                          >
                            <FaUserCheck />
                            {updatingId === member.id ? "Updating..." : "Activate"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {showModal && (
          <div className="admin-staff-modal-overlay" onClick={closeModal}>
            <div
              className="admin-staff-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-staff-modal-head">
                <div>
                  <h2>{isEditMode ? "Edit Staff" : "Add Staff"}</h2>
                  <p>
                    {isEditMode
                      ? "Update staff details and access status."
                      : "Create a Google-based staff account before first login."}
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-staff-modal-close"
                  onClick={closeModal}
                >
                  <FaTimes />
                </button>
              </div>

              <form className="admin-staff-form" onSubmit={handleSaveStaff}>
                <div className="admin-staff-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="admin-staff-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                </div>

                <div className="admin-staff-form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="TECHNICIAN">TECHNICIAN</option>
                  </select>
                </div>

                <div className="admin-staff-form-checkbox">
                  <input
                    id="staff-active"
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <label htmlFor="staff-active">Account is active</label>
                </div>

                <div className="admin-staff-form-note">
                  This system uses Google login. Newly added staff can sign in
                  later using the same email address.
                </div>

                <div className="admin-staff-form-actions">
                  <button
                    type="button"
                    className="admin-staff-cancel-btn"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="admin-staff-save-btn"
                    disabled={saving}
                  >
                    {saving
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : isEditMode
                      ? "Update Staff"
                      : "Create Staff"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}