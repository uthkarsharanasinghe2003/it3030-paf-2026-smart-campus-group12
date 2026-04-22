import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaTicketAlt,
  FaHourglassHalf,
  FaTools,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaPlus,
  FaMapMarkerAlt,
  FaUserCog,
  FaCalendarAlt,
  FaLayerGroup,
} from "react-icons/fa";
import RegisteredNavbar from "../Navbar/RegisteredNavbar/RegisteredNavbar";
import Footer from "../Footer/Footer";
import "./MyTicketsPage.css";

const API_BASE = "http://localhost:8081/api/tickets";

export default function MyTicketsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userEmail = user?.email || "";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/user`, {
        params: {
          email: userEmail,
          status: statusFilter,
        },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      const sorted = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
      setTickets(sorted);
    } catch (error) {
      console.error(error);
      alert("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const q = searchTerm.toLowerCase();
      return (
        (ticket.ticketCode || "").toLowerCase().includes(q) ||
        (ticket.category || "").toLowerCase().includes(q) ||
        (ticket.resourceLocation || "").toLowerCase().includes(q) ||
        (ticket.priority || "").toLowerCase().includes(q) ||
        (ticket.status || "").toLowerCase().includes(q)
      );
    });
  }, [tickets, searchTerm]);

  const summary = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: tickets.filter((t) => t.status === "RESOLVED").length,
      rejected: tickets.filter((t) => t.status === "REJECTED").length,
    };
  }, [tickets]);

  const getTrackingState = (status) => {
    const normalized = (status || "").toUpperCase();

    if (normalized === "RESOLVED") {
      return {
        lineClass: "resolved",
        steps: [
          { label: "Submitted", active: true, done: true },
          { label: "Reviewed", active: true, done: true },
          { label: "In Progress", active: true, done: true },
          { label: "Resolved", active: true, done: true },
        ],
      };
    }

    if (normalized === "IN_PROGRESS") {
      return {
        lineClass: "progress",
        steps: [
          { label: "Submitted", active: true, done: true },
          { label: "Reviewed", active: true, done: true },
          { label: "In Progress", active: true, done: false },
          { label: "Resolved", active: false, done: false },
        ],
      };
    }

    if (normalized === "REJECTED") {
      return {
        lineClass: "rejected",
        steps: [
          { label: "Submitted", active: true, done: true },
          { label: "Reviewed", active: true, done: true },
          { label: "Rejected", active: true, done: false },
        ],
      };
    }

    return {
      lineClass: "open",
      steps: [
        { label: "Submitted", active: true, done: true },
        { label: "Reviewed", active: true, done: false },
        { label: "In Progress", active: false, done: false },
        { label: "Resolved", active: false, done: false },
      ],
    };
  };

  const getPriorityClass = (priority) => {
    const normalized = (priority || "").toUpperCase();
    if (normalized === "URGENT") return "priority-urgent";
    if (normalized === "HIGH") return "priority-high";
    if (normalized === "MEDIUM") return "priority-medium";
    return "priority-low";
  };

  return (
    <>
      <RegisteredNavbar />

      <div className="mytickets-page">
        <div className="mytickets-page-overlay"></div>

        <div className="mytickets-shell">
          <section className="mytickets-hero">
            <div className="mytickets-hero-left">
              <div className="mytickets-chip">Support Center</div>
              <h1>My Tickets</h1>
              <p>
                Track ticket progress, technician assignment, status updates,
                and final resolutions from one professional dashboard.
              </p>
            </div>

            <Link to="/create-ticket" className="mytickets-create-btn">
              <FaPlus />
              New Ticket
            </Link>
          </section>

          <section className="mytickets-summary-grid">
            <div className="mytickets-summary-card">
              <div className="mytickets-summary-icon total">
                <FaTicketAlt />
              </div>
              <div>
                <h3>{summary.total}</h3>
                <p>Total Tickets</p>
              </div>
            </div>

            <div className="mytickets-summary-card">
              <div className="mytickets-summary-icon open">
                <FaHourglassHalf />
              </div>
              <div>
                <h3>{summary.open}</h3>
                <p>Open</p>
              </div>
            </div>

            <div className="mytickets-summary-card">
              <div className="mytickets-summary-icon progress">
                <FaTools />
              </div>
              <div>
                <h3>{summary.inProgress}</h3>
                <p>In Progress</p>
              </div>
            </div>

            <div className="mytickets-summary-card">
              <div className="mytickets-summary-icon resolved">
                <FaCheckCircle />
              </div>
              <div>
                <h3>{summary.resolved}</h3>
                <p>Resolved</p>
              </div>
            </div>

            <div className="mytickets-summary-card">
              <div className="mytickets-summary-icon rejected">
                <FaTimesCircle />
              </div>
              <div>
                <h3>{summary.rejected}</h3>
                <p>Rejected</p>
              </div>
            </div>
          </section>

          <section className="mytickets-filter-card">
            <div className="mytickets-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search by ticket ID, category, resource, priority..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </section>

          <section className="mytickets-list-section">
            <div className="mytickets-list-head">
              <h2>Ticket Records</h2>
              <span>{filteredTickets.length} results found</span>
            </div>

            {loading ? (
              <div className="mytickets-empty">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="mytickets-empty">No tickets found</div>
            ) : (
              <div className="mytickets-grid">
                {filteredTickets.map((ticket) => {
                  const tracking = getTrackingState(ticket.status);

                  return (
                    <Link
                      to={`/my-tickets/${ticket.id}`}
                      key={ticket.id}
                      className="mytickets-card"
                    >
                      <div className="mytickets-card-top">
                        <div>
                          <h3>{ticket.ticketCode || `TK-${ticket.id}`}</h3>
                          <p>{ticket.category || "General Issue"}</p>
                        </div>

                        <div className="mytickets-badge-group">
                          <span
                            className={`ticket-status ${ticket.status?.toLowerCase()}`}
                          >
                            {ticket.status}
                          </span>

                          <span
                            className={`mytickets-priority-badge ${getPriorityClass(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority || "LOW"}
                          </span>
                        </div>
                      </div>

                      <div className="mytickets-info-panel">
                        <div className="mytickets-info-row">
                          <span>
                            <FaMapMarkerAlt />
                            Resource / Location
                          </span>
                          <strong>{ticket.resourceLocation || "N/A"}</strong>
                        </div>

                        <div className="mytickets-info-row">
                          <span>
                            <FaUserCog />
                            Assigned Technician
                          </span>
                          <strong>
                            {ticket.assignedTechnicianName || "Not Assigned Yet"}
                          </strong>
                        </div>

                        <div className="mytickets-info-row">
                          <span>
                            <FaCalendarAlt />
                            Created Date
                          </span>
                          <strong>
                            {ticket.createdAt
                              ? new Date(ticket.createdAt).toLocaleString()
                              : "N/A"}
                          </strong>
                        </div>

                        <div className="mytickets-info-row">
                          <span>
                            <FaLayerGroup />
                            Category
                          </span>
                          <strong>{ticket.category || "N/A"}</strong>
                        </div>
                      </div>

                      <div className="mytickets-tracker-box">
                        <div className="mytickets-tracker-head">
                          <h4>Tracking Progress</h4>
                          <span
                            className={`mytickets-track-badge ${tracking.lineClass}`}
                          >
                            {ticket.status}
                          </span>
                        </div>

                        <div
                          className={`mytickets-track-line ${tracking.lineClass}`}
                        ></div>

                        <div
                          className={`mytickets-track-steps ${
                            tracking.steps.length === 3
                              ? "three-steps"
                              : "four-steps"
                          }`}
                        >
                          {tracking.steps.map((step, index) => (
                            <div
                              className={`mytickets-track-step ${
                                step.active ? "active" : ""
                              } ${step.done ? "done" : ""}`}
                              key={index}
                            >
                              <div className="mytickets-track-dot"></div>
                              <span>{step.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}