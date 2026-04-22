import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import TechnicianLayout from "../TechnicianLayout/TechnicianLayout";
import "./TechnicianTicketsPage.css";

const API_BASE = "http://localhost:8081/api/tickets";

export default function TechnicianTicketsPage() {
  const technician = JSON.parse(localStorage.getItem("user") || "null");

  const [tickets, setTickets] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/technician`, {
        params: { email: technician?.email || "" },
      });
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load technician tickets:", error);
      alert("Failed to load technician tickets");
    } finally {
      setLoading(false);
    }
  };

  const resolveTicket = async (ticketId) => {
    const resolutionNotes = notes[ticketId];

    if (!resolutionNotes?.trim()) {
      alert("Enter resolution notes");
      return;
    }

    try {
      await axios.patch(`${API_BASE}/${ticketId}/resolve`, null, {
        params: {
          technicianName:
            technician?.fullName || technician?.name || "Technician",
          technicianEmail: technician?.email || "",
          resolutionNotes,
        },
      });

      alert("Ticket marked as resolved");
      fetchTickets();
    } catch (error) {
      console.error("Failed to resolve ticket:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to resolve ticket"
      );
    }
  };

  const summary = useMemo(() => {
    const open = tickets.filter((t) => t.status === "OPEN").length;
    const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
    const resolved = tickets.filter((t) => t.status === "RESOLVED").length;
    const urgent = tickets.filter((t) => t.priority === "URGENT").length;

    return {
      total: tickets.length,
      open,
      inProgress,
      resolved,
      urgent,
    };
  }, [tickets]);

  const getStatusClass = (status) => {
    switch ((status || "").toUpperCase()) {
      case "OPEN":
        return "scht-status-open";
      case "IN_PROGRESS":
        return "scht-status-progress";
      case "RESOLVED":
        return "scht-status-resolved";
      case "REJECTED":
        return "scht-status-rejected";
      default:
        return "scht-status-default";
    }
  };

  const getPriorityClass = (priority) => {
    switch ((priority || "").toUpperCase()) {
      case "URGENT":
        return "scht-priority-urgent";
      case "HIGH":
        return "scht-priority-high";
      case "MEDIUM":
        return "scht-priority-medium";
      case "LOW":
        return "scht-priority-low";
      default:
        return "scht-priority-low";
    }
  };

  return (
    <TechnicianLayout activeTab="tickets">
      <div className="scht-page">
        <div className="scht-shell">
          <div className="scht-hero">
            <div className="scht-hero-left">
              <span className="scht-chip">Technician Workspace</span>
              <h1>Assigned Tickets</h1>
              <p>
                View assigned issues, manage work updates, and mark tickets as
                resolved with clear resolution notes.
              </p>
            </div>

            <div className="scht-summary-grid">
              <div className="scht-summary-card">
                <span>Total Tickets</span>
                <h3>{summary.total}</h3>
              </div>
              <div className="scht-summary-card">
                <span>Open</span>
                <h3>{summary.open}</h3>
              </div>
              <div className="scht-summary-card">
                <span>In Progress</span>
                <h3>{summary.inProgress}</h3>
              </div>
              <div className="scht-summary-card">
                <span>Resolved</span>
                <h3>{summary.resolved}</h3>
              </div>
            </div>
          </div>

          <div className="scht-toolbar">
            <div className="scht-toolbar-left">
              <h2>Ticket Queue</h2>
              <p>Assigned work items for the current technician</p>
            </div>

            <div className="scht-toolbar-right">
              <span className="scht-urgent-badge">
                Urgent Tickets: {summary.urgent}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="scht-empty">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="scht-empty">No assigned tickets found</div>
          ) : (
            <div className="scht-grid">
              {tickets.map((ticket) => (
                <div className="scht-card" key={ticket.id}>
                  <div className="scht-card-top">
                    <div className="scht-card-title-wrap">
                      <h3>{ticket.ticketCode || `TKT-${ticket.id}`}</h3>
                      <p>{ticket.category || "General Issue"}</p>
                    </div>

                    <div className="scht-badge-group">
                      <span
                        className={`scht-status-badge ${getStatusClass(
                          ticket.status
                        )}`}
                      >
                        {ticket.status || "OPEN"}
                      </span>
                      <span
                        className={`scht-priority-badge ${getPriorityClass(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority || "LOW"}
                      </span>
                    </div>
                  </div>

                  <div className="scht-info-panel">
                    <div className="scht-info-row">
                      <span>Location</span>
                      <strong>{ticket.resourceLocation || "N/A"}</strong>
                    </div>

                    <div className="scht-info-row">
                      <span>User</span>
                      <strong>{ticket.userName || "N/A"}</strong>
                    </div>

                    <div className="scht-info-row">
                      <span>Contact</span>
                      <strong>{ticket.userEmail || "N/A"}</strong>
                    </div>

                    <div className="scht-info-row scht-info-row-block">
                      <span>Description</span>
                      <p>{ticket.description || "No description available"}</p>
                    </div>
                  </div>

                  <div className="scht-action-panel">
                    <label className="scht-label">Resolution Notes</label>
                    <textarea
                      rows="4"
                      placeholder="Add clear resolution notes before marking this ticket as resolved..."
                      value={notes[ticket.id] || ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [ticket.id]: e.target.value,
                        }))
                      }
                    />

                    <button
                      className="scht-resolve-btn"
                      onClick={() => resolveTicket(ticket.id)}
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TechnicianLayout>
  );
}