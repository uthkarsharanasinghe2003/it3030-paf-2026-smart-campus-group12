import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaEdit,
  FaPlus,
  FaSearch,
  FaTrash,
  FaUserCheck,
  FaUserShield,
  FaUserTimes,
  FaTimes,
  FaGoogle,
} from "react-icons/fa";
import AdminLayout from "../AdminLayout/AdminLayout";
import "./AdminUserManagement.css";

const API_BASE = "http://localhost:8081/api/users";

const initialForm = {
  fullName: "",
  email: "",
  role: "USER",
  active: true,
};

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load users:", error);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return users.filter((user) => {
      return (
        (user.fullName || "").toLowerCase().includes(search) ||
        (user.email || "").toLowerCase().includes(search) ||
        (user.authProvider || "").toLowerCase().includes(search) ||
        (user.role || "").toLowerCase().includes(search)
      );
    });
  }, [users, searchTerm]);

  const activeCount = users.filter((u) => u.active && !u.deleted).length;
  const blockedCount = users.filter((u) => !u.active || u.deleted).length;

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setIsEditMode(true);
    setEditingUserId(user.id);
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "USER",
      active: user.active && !user.deleted,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setIsEditMode(false);
    setEditingUserId(null);
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

    if (!formData.role.trim()) {
      alert("Role is required");
      return false;
    }

    return true;
  };

  const handleSaveUser = async (e) => {
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
        await axios.put(`${API_BASE}/${editingUserId}`, payload);
        alert("User updated successfully");
      } else {
        await axios.post(API_BASE, payload);
        alert("User created successfully");
      }

      closeModal();
      fetchUsers();
    } catch (error) {
      console.error("Save user failed:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to save user"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this user?"
    );
    if (!confirmed) return;

    try {
      setUpdatingId(id);
      await axios.patch(`${API_BASE}/${id}/deactivate`);
      alert("User deactivated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Deactivate failed:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to deactivate user"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleActivate = async (id) => {
    try {
      setUpdatingId(id);
      await axios.patch(`${API_BASE}/${id}/activate`);
      alert("User activated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Activate failed:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to activate user"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout activeTab="users">
      <div className="admin-user-page">
        <div className="admin-user-page-overlay"></div>

        <div className="admin-user-shell">
          <section className="admin-user-hero">
            <div className="admin-user-hero-left">
              <div className="admin-user-chip">User Control</div>
              <h1>Manage registered users</h1>
              <p>
                Add new Google-based user records, edit user roles, and control
                account access from one place.
              </p>

              <div className="admin-user-hero-actions">
                <button
                  type="button"
                  className="admin-user-add-btn"
                  onClick={openAddModal}
                >
                  <FaPlus />
                  Add User
                </button>
              </div>
            </div>

            <div className="admin-user-hero-right">
              <div className="admin-user-stat-card">
                <div className="admin-user-stat-icon active">
                  <FaUserCheck />
                </div>
                <div>
                  <h3>{activeCount}</h3>
                  <p>Active Users</p>
                </div>
              </div>

              <div className="admin-user-stat-card">
                <div className="admin-user-stat-icon blocked">
                  <FaUserTimes />
                </div>
                <div>
                  <h3>{blockedCount}</h3>
                  <p>Blocked Users</p>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-user-filter-card">
            <div className="admin-user-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search by name, email, provider, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </section>

          <section className="admin-user-list-card">
            <div className="admin-user-list-head">
              <h2>Users</h2>
              <span>{filteredUsers.length} records found</span>
            </div>

            {loading ? (
              <div className="admin-user-empty">
                <h3>Loading users...</h3>
                <p>Please wait while users are being loaded.</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="admin-user-empty">
                <h3>No users found</h3>
                <p>Try another search.</p>
              </div>
            ) : (
              <div className="admin-user-grid">
                {filteredUsers.map((user) => {
                  const isActive = user.active && !user.deleted;
                  const isLinked = !!user.googleId;

                  return (
                    <div className="admin-user-card" key={user.id}>
                      <div className="admin-user-card-top">
                        <div className="admin-user-avatar">
                          <FaUserShield />
                        </div>
                        <div className="admin-user-card-title">
                          <h3>{user.fullName || "Unnamed User"}</h3>
                          <p>{user.email}</p>
                        </div>
                      </div>

                      <div className="admin-user-badge-row">
                        <span
                          className={`admin-user-badge ${
                            isActive ? "active" : "blocked"
                          }`}
                        >
                          {isActive ? "Active" : "Blocked"}
                        </span>

                        <span
                          className={`admin-user-badge ${
                            isLinked ? "linked" : "pending"
                          }`}
                        >
                          <FaGoogle />
                          {isLinked ? "Google Linked" : "Pending Login"}
                        </span>
                      </div>

                      <div className="admin-user-info-list">
                        <div className="admin-user-info-row">
                          <span>User ID</span>
                          <strong>{user.id}</strong>
                        </div>

                        <div className="admin-user-info-row">
                          <span>Role</span>
                          <strong>{user.role || "USER"}</strong>
                        </div>

                        <div className="admin-user-info-row">
                          <span>Provider</span>
                          <strong>{user.authProvider || "GOOGLE"}</strong>
                        </div>

                        <div className="admin-user-info-row">
                          <span>Google Account</span>
                          <strong>
                            {isLinked ? "Linked" : "Not linked yet"}
                          </strong>
                        </div>
                      </div>

                      <div className="admin-user-action-row multi">
                        <button
                          type="button"
                          className="admin-user-edit-btn"
                          onClick={() => openEditModal(user)}
                        >
                          <FaEdit />
                          Edit
                        </button>

                        {isActive ? (
                          <button
                            type="button"
                            className="admin-user-delete-btn"
                            onClick={() => handleDeactivate(user.id)}
                            disabled={updatingId === user.id}
                          >
                            <FaTrash />
                            {updatingId === user.id
                              ? "Updating..."
                              : "Deactivate"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-user-activate-btn"
                            onClick={() => handleActivate(user.id)}
                            disabled={updatingId === user.id}
                          >
                            <FaUserCheck />
                            {updatingId === user.id ? "Updating..." : "Activate"}
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
          <div className="admin-user-modal-overlay" onClick={closeModal}>
            <div
              className="admin-user-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-user-modal-head">
                <div>
                  <h2>{isEditMode ? "Edit User" : "Add User"}</h2>
                  <p>
                    {isEditMode
                      ? "Update user details and access status."
                      : "Create a Google-based user record before first login."}
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-user-modal-close"
                  onClick={closeModal}
                >
                  <FaTimes />
                </button>
              </div>

              <form className="admin-user-form" onSubmit={handleSaveUser}>
                <div className="admin-user-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="admin-user-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                </div>

                <div className="admin-user-form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="TECHNICIAN">TECHNICIAN</option>
                  </select>
                </div>

                <div className="admin-user-form-checkbox">
                  <input
                    id="active"
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <label htmlFor="active">Account is active</label>
                </div>

                <div className="admin-user-form-note">
                  This system uses Google login. Newly added users can sign in
                  later using the same email address.
                </div>

                <div className="admin-user-form-actions">
                  <button
                    type="button"
                    className="admin-user-cancel-btn"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="admin-user-save-btn"
                    disabled={saving}
                  >
                    {saving
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : isEditMode
                      ? "Update User"
                      : "Create User"}
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