import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ResourceListPage.css";
import RegisteredNavbar from "../../Website/Navbar/RegisteredNavbar/RegisteredNavbar";
import UnregisteredNavbar from "../../Website/Navbar/UnregisteredNavbar/UnregisteredNavbar";
import Footer from "../../Website/Footer/Footer";

const API_BASE = "http://localhost:8081/api/resources";

export default function ResourceListPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [capacityFilter, setCapacityFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

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
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch = (resource.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "All" || resource.type === typeFilter;

      const matchesLocation =
        locationFilter === "All" || resource.location === locationFilter;

      const capacity = Number(resource.capacity || 0);

      const matchesCapacity =
        capacityFilter === "All" ||
        (capacityFilter === "1-20" && capacity >= 1 && capacity <= 20) ||
        (capacityFilter === "21-50" && capacity >= 21 && capacity <= 50) ||
        (capacityFilter === "51+" && capacity >= 51);

      return (
        matchesSearch &&
        matchesType &&
        matchesLocation &&
        matchesCapacity
      );
    });
  }, [resources, searchTerm, typeFilter, locationFilter, capacityFilter]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setTypeFilter("All");
    setCapacityFilter("All");
    setLocationFilter("All");
  };

  const locationOptions = [
    ...new Set(resources.map((r) => r.location).filter(Boolean)),
  ];
  const typeOptions = [
    ...new Set(resources.map((r) => r.type).filter(Boolean)),
  ];

  return (
    <>
      {user ? <RegisteredNavbar /> : <UnregisteredNavbar />}

      <div className="resource-page">
        <div className="resource-page-overlay"></div>

        <div className="resource-container">
          <section className="resource-hero">
            <div className="resource-hero-left">
              <div className="resource-chip">Resource Catalogue</div>
              <h1>Browse facilities and assets available for campus use</h1>
              <p>
                Search and explore lecture halls, labs, meeting rooms, and
                equipment. Filter resources by type, capacity, and location to
                quickly find what you need.
              </p>

              <div className="resource-hero-mini-stats">
                <div className="resource-mini-stat">
                  <h4>{resources.length}</h4>
                  <span>Total Resources</span>
                </div>
                <div className="resource-mini-stat">
                  <h4>{filteredResources.length}</h4>
                  <span>Filtered Results</span>
                </div>
                <div className="resource-mini-stat">
                  <h4>{typeOptions.length}</h4>
                  <span>Resource Types</span>
                </div>
              </div>

              {!user && (
                <div className="resource-guest-note">
                  <strong>Guest Access:</strong> You can browse resources now.
                  Login or register to manage campus services.
                </div>
              )}
            </div>

            <div className="resource-hero-right">
              <div className="resource-hero-card">
                <div className="resource-hero-card-topline">Campus Overview</div>
                <h3>Total Resources</h3>
                <div className="resource-hero-count">{resources.length}</div>
                <p>
                  {user
                    ? "You can browse and report issues for available campus resources."
                    : "Browse campus spaces and sign in to report issues."}
                </p>

                <div className="resource-hero-tags">
                  <span>Lecture Halls</span>
                  <span>Labs</span>
                  <span>Equipment</span>
                </div>
              </div>
            </div>
          </section>

          <section className="resource-filter-section">
            <div className="resource-filter-head">
              <div>
                <h2>Search and Filter</h2>
                <p>Use filters to quickly narrow down available resources.</p>
              </div>

              <button
                className="resource-reset-btn"
                onClick={handleResetFilters}
                type="button"
              >
                Reset Filters
              </button>
            </div>

            <div className="resource-filter-grid">
              <div className="resource-input-group resource-input-search">
                <label>Search by Name</label>
                <input
                  type="text"
                  placeholder="Search resource name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="resource-input-group">
                <label>Filter by Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="resource-input-group">
                <label>Filter by Capacity</label>
                <select
                  value={capacityFilter}
                  onChange={(e) => setCapacityFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="1-20">1 - 20</option>
                  <option value="21-50">21 - 50</option>
                  <option value="51+">51+</option>
                </select>
              </div>

              <div className="resource-input-group">
                <label>Filter by Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="resource-results-section">
            <div className="resource-results-head">
              <div>
                <h2>Available Resources</h2>
                <p>Browse the latest facilities and assets ready for campus use.</p>
              </div>
              <span>{filteredResources.length} results found</span>
            </div>

            {loading ? (
              <div className="resource-empty-state">
                <div className="resource-empty-icon">⌛</div>
                <h3>Loading resources...</h3>
                <p>Please wait while resources are being loaded.</p>
              </div>
            ) : filteredResources.length > 0 ? (
              <div className="resource-grid">
                {filteredResources.map((resource) => (
                  <div className="resource-card" key={resource.id}>
                    <div className="resource-card-image-wrap">
                      <img
                        src={
                          resource.image ||
                          "https://via.placeholder.com/400x220?text=No+Image"
                        }
                        alt={resource.name}
                        className="resource-card-image"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x220?text=No+Image";
                        }}
                      />
                    </div>

                    <div className="resource-card-body">
                      <div className="resource-card-top">
                        <span className="resource-type-badge">{resource.type}</span>
                        <span
                          className={`resource-status-badge ${
                            resource.status === "ACTIVE"
                              ? "active"
                              : "out-of-service"
                          }`}
                        >
                          {resource.status}
                        </span>
                      </div>

                      <h3>{resource.name}</h3>
                      <p className="resource-description">{resource.description}</p>

                      <div className="resource-details-list">
                        <div className="resource-detail-row">
                          <span>Capacity</span>
                          <strong>{resource.capacity}</strong>
                        </div>

                        <div className="resource-detail-row">
                          <span>Location</span>
                          <strong>{resource.location}</strong>
                        </div>

                        <div className="resource-detail-row">
                          <span>Availability</span>
                          <strong>{resource.availability}</strong>
                        </div>

                        <div className="resource-detail-row">
                          <span>Equipment</span>
                          <strong>{resource.equipment || "None"}</strong>
                        </div>
                      </div>

                      <div className="resource-slot-list">
                        {resource.slot1 && (
                          <span className="resource-slot-badge">{resource.slot1}</span>
                        )}
                        {resource.slot2 && (
                          <span className="resource-slot-badge">{resource.slot2}</span>
                        )}
                        {resource.slot3 && (
                          <span className="resource-slot-badge">{resource.slot3}</span>
                        )}
                      </div>

                      <div className="resource-card-actions">
                        <Link
                          to={`/resources/${resource.id}`}
                          className="resource-view-btn"
                        >
                          View Details
                        </Link>

                        {user ? (
                          <Link
                            to="/create-ticket"
                            state={{
                              resourceId: resource.id,
                              resourceName: resource.name,
                              resourceLocation: resource.location,
                              resourceType: resource.type,
                              resourceDescription: resource.description,
                            }}
                            className="resource-book-btn"
                          >
                            Issue Report
                          </Link>
                        ) : (
                          <Link to="/login" className="resource-book-btn guest-mode">
                            Login to Report
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="resource-empty-state">
                <div className="resource-empty-icon">🔍</div>
                <h3>No resources found</h3>
                <p>
                  Try changing your search keyword or filters to see more
                  results.
                </p>
                <button
                  className="resource-reset-btn resource-reset-inline"
                  onClick={handleResetFilters}
                  type="button"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}