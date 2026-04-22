import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaSyncAlt,
  FaSearch,
  FaImage,
} from "react-icons/fa";
import AdminLayout from "../AdminLayout/AdminLayout";
import "./AdminResourceManagement.css";

const API_BASE = "http://localhost:8081/api/resources";

const initialForm = {
  name: "",
  type: "Lecture Hall",
  capacity: "",
  location: "",
  availability: "",
  status: "ACTIVE",
  description: "",
  image: "",
  equipment: [],
  slot1: "",
  slot2: "",
  slot3: "",
};

const equipmentOptionsByType = {
  "Lecture Hall": [
    "Projector",
    "Mic",
    "Whiteboard",
    "AC",
    "Non AC",
    "Speaker",
  ],
  Lab: ["Computers", "Projector", "Printer", "Whiteboard", "AC", "Non AC"],
  "Meeting Room": [
    "Projector",
    "TV",
    "Whiteboard",
    "AC",
    "Non AC",
    "Speaker",
  ],
  Equipment: ["Projector", "Camera", "Mic", "Speaker", "Printer"],
};

export default function AdminResourceManagement() {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setResources(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      alert("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const search = searchTerm.toLowerCase();
      return (
        (resource.name || "").toLowerCase().includes(search) ||
        (resource.type || "").toLowerCase().includes(search) ||
        (resource.location || "").toLowerCase().includes(search) ||
        (resource.status || "").toLowerCase().includes(search) ||
        (resource.equipment || "").toLowerCase().includes(search)
      );
    });
  }, [resources, searchTerm]);

  const currentEquipmentOptions = equipmentOptionsByType[formData.type] || [];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: name === "capacity" ? value.replace(/[^\d]/g, "") : value,
      };

      if (name === "type") {
        updated.equipment = [];
      }

      return updated;
    });
  };

  const handleEquipmentChange = (item) => {
    setFormData((prev) => {
      const exists = prev.equipment.includes(item);

      return {
        ...prev,
        equipment: exists
          ? prev.equipment.filter((eq) => eq !== item)
          : [...prev.equipment, item],
      };
    });
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.type.trim() ||
      !formData.capacity ||
      !formData.location.trim() ||
      !formData.availability.trim() ||
      !formData.status.trim() ||
      !formData.description.trim()
    ) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      image: formData.image.trim(),
      equipment: formData.equipment.join(","),
      slot1: formData.slot1.trim(),
      slot2: formData.slot2.trim(),
      slot3: formData.slot3.trim(),
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, payload);
        alert("Resource updated successfully");
      } else {
        await axios.post(API_BASE, payload);
        alert("Resource added successfully");
      }

      resetForm();
      fetchResources();
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Failed to save resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setFormData({
      name: resource.name || "",
      type: resource.type || "Lecture Hall",
      capacity: resource.capacity || "",
      location: resource.location || "",
      availability: resource.availability || "",
      status: resource.status || "ACTIVE",
      description: resource.description || "",
      image: resource.image || "",
      equipment: resource.equipment
        ? resource.equipment.split(",").filter(Boolean)
        : [],
      slot1: resource.slot1 || "",
      slot2: resource.slot2 || "",
      slot3: resource.slot3 || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      alert("Resource deleted successfully");
      fetchResources();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete resource");
    }
  };

  const totalResources = resources.length;
  const activeResources = resources.filter((r) => r.status === "ACTIVE").length;
  const outOfServiceResources = resources.filter(
    (r) => r.status === "OUT_OF_SERVICE"
  ).length;

  return (
    <AdminLayout activeTab="resources">
      <div className="admin-resource-page">
        <div className="admin-resource-page-overlay"></div>

        <div className="admin-resource-shell">
          <section className="admin-resource-hero">
            <div className="admin-resource-hero-left">
              <div className="admin-resource-chip">Admin Resource Center</div>
              <h1>Manage campus resources with full control</h1>
              <p>
                Add, edit, update, and remove campus resources with related
                equipment and 3 time slots.
              </p>
            </div>

            <div className="admin-resource-hero-right">
              <div className="admin-resource-stat-card">
                <div className="admin-resource-stat-icon">
                  <FaBoxOpen />
                </div>
                <div>
                  <h3>{totalResources}</h3>
                  <p>Total Resources</p>
                </div>
              </div>

              <div className="admin-resource-stat-card">
                <div className="admin-resource-stat-icon active">
                  <FaLayerGroup />
                </div>
                <div>
                  <h3>{activeResources}</h3>
                  <p>Active</p>
                </div>
              </div>

              <div className="admin-resource-stat-card">
                <div className="admin-resource-stat-icon danger">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h3>{outOfServiceResources}</h3>
                  <p>Out of Service</p>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-resource-main-grid">
            <div className="admin-resource-form-card">
              <div className="admin-resource-section-head">
                <h2>{editingId ? "Edit Resource" : "Add New Resource"}</h2>
                <button
                  type="button"
                  className="admin-resource-secondary-btn"
                  onClick={resetForm}
                >
                  <FaSyncAlt />
                  Reset
                </button>
              </div>

              <form className="admin-resource-form" onSubmit={handleSubmit}>
                <div className="admin-resource-form-grid">
                  <div className="admin-resource-input-group">
                    <label>Resource Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter resource name"
                    />
                  </div>

                  <div className="admin-resource-input-group">
                    <label>Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="Lecture Hall">Lecture Hall</option>
                      <option value="Lab">Lab</option>
                      <option value="Meeting Room">Meeting Room</option>
                      <option value="Equipment">Equipment</option>
                    </select>
                  </div>

                  <div className="admin-resource-input-group">
                    <label>Capacity</label>
                    <input
                      type="text"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="Enter capacity"
                    />
                  </div>

                  <div className="admin-resource-input-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter location"
                    />
                  </div>

                  <div className="admin-resource-input-group admin-resource-full-width">
                    <label>Availability</label>
                    <input
                      type="text"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      placeholder="Example: Mon - Fri, 8.00 AM - 5.00 PM"
                    />
                  </div>

                  <div className="admin-resource-input-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                    </select>
                  </div>

                  <div className="admin-resource-input-group admin-resource-full-width">
                    <label>Image URL</label>
                    <div className="admin-resource-image-input-wrap">
                      <FaImage />
                      <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="Paste image URL here"
                      />
                    </div>
                  </div>

                  <div className="admin-resource-input-group admin-resource-full-width">
                    <label>Available Equipment</label>
                    <div className="admin-resource-equipment-box">
                      {currentEquipmentOptions.map((item) => (
                        <label
                          key={item}
                          className="admin-resource-checkbox-item"
                        >
                          <input
                            type="checkbox"
                            checked={formData.equipment.includes(item)}
                            onChange={() => handleEquipmentChange(item)}
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="admin-resource-input-group">
                    <label>Time Slot 1</label>
                    <input
                      type="text"
                      name="slot1"
                      value={formData.slot1}
                      onChange={handleChange}
                      placeholder="8.00 AM - 10.00 AM"
                    />
                  </div>

                  <div className="admin-resource-input-group">
                    <label>Time Slot 2</label>
                    <input
                      type="text"
                      name="slot2"
                      value={formData.slot2}
                      onChange={handleChange}
                      placeholder="10.30 AM - 12.30 PM"
                    />
                  </div>

                  <div className="admin-resource-input-group">
                    <label>Time Slot 3</label>
                    <input
                      type="text"
                      name="slot3"
                      value={formData.slot3}
                      onChange={handleChange}
                      placeholder="1.30 PM - 3.30 PM"
                    />
                  </div>

                  {formData.image && (
                    <div className="admin-resource-full-width">
                      <div className="admin-resource-image-preview">
                        <img
                          src={formData.image}
                          alt="Preview"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/500x250?text=Invalid+Image+URL";
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="admin-resource-input-group admin-resource-full-width">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter resource description"
                      rows="5"
                    ></textarea>
                  </div>
                </div>

                <div className="admin-resource-form-actions">
                  <button
                    type="submit"
                    className="admin-resource-primary-btn"
                    disabled={submitting}
                  >
                    {editingId ? <FaEdit /> : <FaPlus />}
                    {submitting
                      ? "Saving..."
                      : editingId
                      ? "Update Resource"
                      : "Add Resource"}
                  </button>
                </div>
              </form>
            </div>

            <div className="admin-resource-list-card">
              <div className="admin-resource-section-head">
                <h2>Resource Directory</h2>

                <div className="admin-resource-search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="admin-resource-empty-state">
                  <h3>Loading resources...</h3>
                  <p>Please wait while resource records are being loaded.</p>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="admin-resource-empty-state">
                  <h3>No resources found</h3>
                  <p>Try adding a new resource or changing your search.</p>
                </div>
              ) : (
                <div className="admin-resource-grid-list">
                  {filteredResources.map((resource) => (
                    <div className="admin-resource-mini-card" key={resource.id}>
                      <div className="admin-resource-mini-image">
                        <img
                          src={
                            resource.image ||
                            "https://via.placeholder.com/400x220?text=No+Image"
                          }
                          alt={resource.name}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x220?text=No+Image";
                          }}
                        />
                      </div>

                      <div className="admin-resource-mini-body">
                        <div className="admin-resource-mini-top">
                          <h3>{resource.name}</h3>
                          <span
                            className={`admin-resource-status ${
                              resource.status === "ACTIVE"
                                ? "active"
                                : "out-of-service"
                            }`}
                          >
                            {resource.status}
                          </span>
                        </div>

                        <p>{resource.type}</p>

                        <div className="admin-resource-mini-meta">
                          <span>Capacity: {resource.capacity}</span>
                          <span>Location: {resource.location}</span>
                          <span>Equipment: {resource.equipment || "None"}</span>
                          <span>Slot 1: {resource.slot1 || "Not set"}</span>
                          <span>Slot 2: {resource.slot2 || "Not set"}</span>
                          <span>Slot 3: {resource.slot3 || "Not set"}</span>
                        </div>

                        <div className="admin-resource-action-group">
                          <button
                            type="button"
                            className="admin-resource-edit-btn"
                            onClick={() => handleEdit(resource)}
                          >
                            <FaEdit />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="admin-resource-delete-btn"
                            onClick={() => handleDelete(resource.id)}
                          >
                            <FaTrash />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}