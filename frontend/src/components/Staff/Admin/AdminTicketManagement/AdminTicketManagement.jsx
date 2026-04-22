import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaClipboardList,
  FaUserCog,
  FaTimesCircle,
  FaSearch,
  FaMapMarkerAlt,
  FaEnvelope,
  FaUser,
  FaTools,
  FaFlag,
  FaFileAlt,
} from "react-icons/fa";
import AdminLayout from "../AdminLayout/AdminLayout";
import "./AdminTicketManagement.css";

const TICKET_API = "http://localhost:8081/api/tickets";
const STAFF_API = "http://localhost:8081/api/staff";

export default function AdminTicketManagement() {
  const admin = JSON.parse(localStorage.getItem("user") || "null");

  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState({});
  const [rejectReasons, setRejectReasons] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTickets();
    fetchTechnicians();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${TICKET_API}/admin`);
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load tickets:", error);
      alert("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await axios.get(STAFF_API);
      const staffList = Array.isArray(res.data) ? res.data : [];

      const technicianList = staffList.filter(
        (staff) => (staff.role || "").toUpperCase() === "TECHNICIAN"
      );

      setTechnicians(technicianList);
    } catch (error) {
      console.error("Failed to load technicians:", error);
      alert("Failed to load technicians");
    }
  };

  const assignTicket = async (ticketId) => {
    const technicianId = selectedTech[ticketId];

    if (!technicianId) {
      alert("Please select a technician first");
      return;
    }

    try {
      await axios.patch(`${TICKET_API}/${ticketId}/assign`, null, {
        params: {
          technicianId,
          adminName: admin?.fullName || admin?.name || "Admin",
          adminEmail: admin?.email || "",
        },
      });

      alert("Technician assigned successfully");
      fetchTickets();
    } catch (error) {
      console.error("Failed to assign technician:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to assign technician"
      );
    }
  };

  const rejectTicket = async (ticketId) => {
    const rejectionReason = rejectReasons[ticketId];

    if (!rejectionReason?.trim()) {
      alert("Please enter a rejection reason");
      return;
    }

    try {
      await axios.patch(`${TICKET_API}/${ticketId}/reject`, null, {
        params: {
          adminName: admin?.fullName || admin?.name || "Admin",
          adminEmail: admin?.email || "",
          rejectionReason,
        },
      });

      alert("Ticket rejected successfully");
      fetchTickets();
    } catch (error) {
      console.error("Failed to reject ticket:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to reject ticket"
      );
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const q = searchTerm.toLowerCase();
    return (
      (ticket.ticketCode || `TKT-${ticket.id}`).toLowerCase().includes(q) ||
      (ticket.userName || "").toLowerCase().includes(q) ||
      (ticket.userEmail || "").toLowerCase().includes(q) ||
      (ticket.category || "").toLowerCase().includes(q) ||
      (ticket.resourceLocation || "").toLowerCase().includes(q) ||
      (ticket.priority || "").toLowerCase().includes(q) ||
      (ticket.status || "").toLowerCase().includes(q)
    );
  });

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const progressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const rejectedCount = tickets.filter((t) => t.status === "REJECTED").length;

  return (
    <AdminLayout activeTab="tickets">
      <div className="admintickets-page">
        <div className="admintickets-page-overlay"></div>

        <div className="admintickets-shell">
          <section className="admintickets-hero">
            <div className="admintickets-hero-left">
              <div className="admintickets-chip">Ticket Control</div>
              <h1>Manage support tickets</h1>
              <p>
                Review submitted issues, assign technicians, and reject invalid
                requests from one organized admin workspace.
              </p>
            </div>

            <div className="admintickets-hero-right">
              <div className="admintickets-stat-card">
                <div className="admintickets-stat-icon open">
                  <FaClipboardList />
                </div>
                <div>
                  <h3>{openCount}</h3>
                  <p>Open Tickets</p>
                </div>
              </div>

              <div className="admintickets-stat-card">
                <div className="admintickets-stat-icon progress">
                  <FaUserCog />
                </div>
                <div>
                  <h3>{progressCount}</h3>
                  <p>In Progress</p>
                </div>
              </div>

              <div className="admintickets-stat-card">
                <div className="admintickets-stat-icon rejected">
                  <FaTimesCircle />
                </div>
                <div>
                  <h3>{rejectedCount}</h3>
                  <p>Rejected</p>
                </div>
              </div>
            </div>
          </section>

          <section className="admintickets-filter-card">
            <div className="admintickets-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search by ticket code, user, email, category, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </section>

          <section className="admintickets-list-card">
            <div className="admintickets-list-head">
              <h2>Ticket Records</h2>
              <span>{filteredTickets.length} records found</span>
            </div>

            {loading ? (
              <div className="admintickets-empty">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="admintickets-empty">No tickets available</div>
            ) : (
              <div className="admintickets-grid">
                {filteredTickets.map((ticket) => (
                  <div className="admintickets-card" key={ticket.id}>
                    <div className="admintickets-top">
                      <div>
                        <h3>{ticket.ticketCode || `TKT-${ticket.id}`}</h3>
                        <p>{ticket.category || "General Issue"}</p>
                      </div>

                      <span
                        className={`admintickets-status ${ticket.status?.toLowerCase()}`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <div className="admintickets-info-grid">
                      <div className="admintickets-info-card">
                        <p>
                          <strong><FaUser /> User</strong>
                        </p>
                        <span>{ticket.userName || "N/A"}</span>
                      </div>

                      <div className="admintickets-info-card">
                        <p>
                          <strong><FaEnvelope /> Email</strong>
                        </p>
                        <span>{ticket.userEmail || "N/A"}</span>
                      </div>

                      <div className="admintickets-info-card">
                        <p>
                          <strong><FaMapMarkerAlt /> Location</strong>
                        </p>
                        <span>{ticket.resourceLocation || "N/A"}</span>
                      </div>

                      <div className="admintickets-info-card">
                        <p>
                          <strong><FaFlag /> Priority</strong>
                        </p>
                        <span>{ticket.priority || "N/A"}</span>
                      </div>
                    </div>

                    <div className="admintickets-description-box">
                      <h4>
                        <FaFileAlt />
                        Description
                      </h4>
                      <p>{ticket.description || "No description provided"}</p>
                    </div>

                    <div className="admintickets-assigned-box">
                      <h4>
                        <FaTools />
                        Assigned Technician
                      </h4>
                      <p>{ticket.assignedTechnicianName || "Not Assigned"}</p>
                    </div>

                    <div className="admintickets-actions">
                      <select
                        value={selectedTech[ticket.id] || ""}
                        onChange={(e) =>
                          setSelectedTech((prev) => ({
                            ...prev,
                            [ticket.id]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Technician</option>
                        {technicians.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.fullName || tech.name} - {tech.email}
                          </option>
                        ))}
                      </select>

                      <button type="button" onClick={() => assignTicket(ticket.id)}>
                        Assign Technician
                      </button>

                      <textarea
                        rows="3"
                        placeholder="Enter rejection reason"
                        value={rejectReasons[ticket.id] || ""}
                        onChange={(e) =>
                          setRejectReasons((prev) => ({
                            ...prev,
                            [ticket.id]: e.target.value,
                          }))
                        }
                      />

                      <button
                        type="button"
                        className="danger"
                        onClick={() => rejectTicket(ticket.id)}
                      >
                        Reject Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}