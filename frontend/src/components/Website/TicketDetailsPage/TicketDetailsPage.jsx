import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import RegisteredNavbar from "../Navbar/RegisteredNavbar/RegisteredNavbar";
import Footer from "../Footer/Footer";
import "./TicketDetailsPage.css";

const API_BASE = "http://localhost:8081/api/tickets";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [ticket, setTicket] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/${id}`);
      setTicket(res.data?.ticket || null);
      setAttachments(res.data?.attachments || []);
      setComments(res.data?.comments || []);
      setHistory(res.data?.history || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;

    try {
      await axios.post(`${API_BASE}/${id}/comments`, null, {
        params: {
          userId: user?.id || "",
          userName: user?.fullName || user?.name || "User",
          userEmail: user?.email || "",
          userRole: user?.role || "USER",
          commentText,
        },
      });

      setCommentText("");
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data || "Failed to add comment");
    }
  };

  const updateComment = async (commentId) => {
    try {
      await axios.put(`${API_BASE}/comments/${commentId}`, null, {
        params: {
          userEmail: user?.email || "",
          commentText: editingText,
        },
      });

      setEditingCommentId(null);
      setEditingText("");
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data || "Failed to update comment");
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`${API_BASE}/comments/${commentId}`, {
        params: {
          userEmail: user?.email || "",
        },
      });
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data || "Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <>
        <RegisteredNavbar />
        <div className="ticket-details-page">
          <div className="ticket-details-shell">
            <div className="ticket-details-empty">Loading ticket details...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        <RegisteredNavbar />
        <div className="ticket-details-page">
          <div className="ticket-details-shell">
            <div className="ticket-details-empty">Ticket not found</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <RegisteredNavbar />

      <div className="ticket-details-page">
        <div className="ticket-details-shell">
          <div className="ticket-summary-card">
            <div>
              <h1>{ticket.ticketCode}</h1>
              <p>{ticket.category}</p>
            </div>

            <span className={`ticket-pill ${ticket.status?.toLowerCase()}`}>
              {ticket.status}
            </span>
          </div>

          <div className="ticket-details-grid">
            <div className="ticket-card">
              <h2>Issue Details</h2>
              <p><strong>Resource / Location:</strong> {ticket.resourceLocation}</p>
              <p><strong>Priority:</strong> {ticket.priority}</p>
              <p><strong>Assigned Technician:</strong> {ticket.assignedTechnicianName || "Not Assigned Yet"}</p>
              <p><strong>Created Date:</strong> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : ""}</p>
              <p><strong>Description:</strong></p>
              <div className="ticket-description-box">{ticket.description}</div>
            </div>

            <div className="ticket-card">
              <h2>Updates</h2>
              <p><strong>Resolution Notes:</strong> {ticket.resolutionNotes || "No resolution yet"}</p>
              <p><strong>Rejection Reason:</strong> {ticket.rejectionReason || "Not rejected"}</p>
            </div>
          </div>

          <div className="ticket-card">
            <h2>Attachments</h2>
            {attachments.length === 0 ? (
              <div className="ticket-empty-line">No attachments uploaded</div>
            ) : (
              <div className="ticket-attachment-grid">
                {attachments.map((item) => (
                  <a
                    key={item.id}
                    href={`http://localhost:8081${item.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ticket-attachment-item"
                  >
                    <img
                      src={`http://localhost:8081${item.fileUrl}`}
                      alt={item.fileName}
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="ticket-card">
            <h2>Status History</h2>
            {history.length === 0 ? (
              <div className="ticket-empty-line">No history yet</div>
            ) : (
              <div className="ticket-history-list">
                {history.map((item) => (
                  <div key={item.id} className="ticket-history-item">
                    <h4>{item.newStatus}</h4>
                    <p>
                      {item.note || "Status updated"} — {item.changedByName} ({item.changedByRole})
                    </p>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ticket-card">
            <h2>Comments</h2>

            <div className="ticket-comment-form">
              <textarea
                rows="4"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
              />
              <button type="button" onClick={addComment}>
                Add Comment
              </button>
            </div>

            {comments.length === 0 ? (
              <div className="ticket-empty-line">No comments yet</div>
            ) : (
              <div className="ticket-comment-list">
                {comments.map((comment) => {
                  const isOwner =
                    (comment.userEmail || "").toLowerCase() ===
                    (user?.email || "").toLowerCase();

                  return (
                    <div key={comment.id} className="ticket-comment-item">
                      <div className="ticket-comment-head">
                        <div>
                          <h4>{comment.userName}</h4>
                          <p>{comment.userRole}</p>
                        </div>
                        <span>
                          {comment.createdAt
                            ? new Date(comment.createdAt).toLocaleString()
                            : ""}
                        </span>
                      </div>

                      {editingCommentId === comment.id ? (
                        <>
                          <textarea
                            rows="3"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                          />
                          <div className="ticket-comment-actions">
                            <button onClick={() => updateComment(comment.id)}>Save</button>
                            <button
                              className="secondary"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingText("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="ticket-comment-body">{comment.commentText}</div>

                          {isOwner && (
                            <div className="ticket-comment-actions">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditingText(comment.commentText);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="danger"
                                onClick={() => deleteComment(comment.id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}