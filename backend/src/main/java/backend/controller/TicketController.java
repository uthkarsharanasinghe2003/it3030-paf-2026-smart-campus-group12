package backend.controller;

import backend.model.Notification;
import backend.model.Ticket;
import backend.model.TicketAttachment;
import backend.model.TicketComment;
import backend.model.TicketStatusHistory;
import backend.model.User;
import backend.repository.NotificationRepository;
import backend.repository.TicketAttachmentRepository;
import backend.repository.TicketCommentRepository;
import backend.repository.TicketRepository;
import backend.repository.TicketStatusHistoryRepository;
import backend.repository.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TicketController {

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketStatusHistoryRepository ticketStatusHistoryRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    private final Path uploadRoot = Paths.get("src/main/uploads/tickets");

    public TicketController(
            TicketRepository ticketRepository,
            TicketAttachmentRepository ticketAttachmentRepository,
            TicketCommentRepository ticketCommentRepository,
            TicketStatusHistoryRepository ticketStatusHistoryRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.ticketAttachmentRepository = ticketAttachmentRepository;
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketStatusHistoryRepository = ticketStatusHistoryRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Ticket createTicket(
            @RequestParam(required = false) Long userId,
            @RequestParam String userName,
            @RequestParam String userEmail,
            @RequestParam String category,
            @RequestParam String resourceLocation,
            @RequestParam String description,
            @RequestParam String priority,
            @RequestParam String contactName,
            @RequestParam String contactEmail,
            @RequestParam(required = false) String contactPhone,
            @RequestParam(value = "files", required = false) MultipartFile[] files
    ) throws IOException {

        validateTicketInputs(category, resourceLocation, description, priority, contactName, contactEmail);

        if (files != null && files.length > 3) {
            throw new RuntimeException("You can upload up to 3 image attachments only");
        }

        Files.createDirectories(uploadRoot);

        Ticket ticket = new Ticket();
        ticket.setUserId(userId);
        ticket.setUserName(userName);
        ticket.setUserEmail(userEmail);
        ticket.setCategory(category);
        ticket.setResourceLocation(resourceLocation);
        ticket.setDescription(description);
        ticket.setPriority(priority.toUpperCase());
        ticket.setStatus("OPEN");
        ticket.setContactName(contactName);
        ticket.setContactEmail(contactEmail);
        ticket.setContactPhone(contactPhone);

        Ticket saved = ticketRepository.save(ticket);
        saved.setTicketCode("TKT-" + (1000 + saved.getId()));
        saved = ticketRepository.save(saved);

        createHistory(saved.getId(), null, "OPEN", userName, userEmail, "USER", "Ticket created");
        createAdminNotification(saved);

        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;

                validateImage(file);

                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path filePath = uploadRoot.resolve(fileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                TicketAttachment attachment = new TicketAttachment();
                attachment.setTicketId(saved.getId());
                attachment.setFileName(file.getOriginalFilename());
                attachment.setFileUrl("/uploads/tickets/" + fileName);
                ticketAttachmentRepository.save(attachment);
            }
        }

        return saved;
    }

    @GetMapping("/user")
    public List<Ticket> getUserTickets(
            @RequestParam String email,
            @RequestParam(required = false) String status
    ) {
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            return ticketRepository.findByUserEmailAndStatusOrderByCreatedAtDesc(email, status.toUpperCase());
        }
        return ticketRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    @GetMapping("/admin")
    public List<Ticket> getAllTicketsForAdmin() {
        return ticketRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    @GetMapping("/technician")
    public List<Ticket> getTechnicianTickets(@RequestParam String email) {
        return ticketRepository.findByAssignedTechnicianEmailOrderByCreatedAtDesc(email);
    }

    @GetMapping("/{id}")
    public Map<String, Object> getTicketDetails(@PathVariable Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("ticket", ticket);
        response.put("attachments", ticketAttachmentRepository.findByTicketIdOrderByUploadedAtAsc(id));
        response.put("comments", ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(id));
        response.put("history", ticketStatusHistoryRepository.findByTicketIdOrderByCreatedAtAsc(id));

        return response;
    }

    @PatchMapping("/{id}/assign")
    public Ticket assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId,
            @RequestParam String adminName,
            @RequestParam String adminEmail
    ) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        if (!"TECHNICIAN".equalsIgnoreCase(technician.getRole())) {
            throw new RuntimeException("Selected user is not a technician");
        }

        ticket.setAssignedTechnicianId(technician.getId());
        ticket.setAssignedTechnicianName(technician.getFullName());
        ticket.setAssignedTechnicianEmail(technician.getEmail());

        String oldStatus = ticket.getStatus();
        ticket.setStatus("IN_PROGRESS");

        Ticket saved = ticketRepository.save(ticket);

        createHistory(
                saved.getId(),
                oldStatus,
                "IN_PROGRESS",
                adminName,
                adminEmail,
                "ADMIN",
                "Ticket assigned to technician: " + technician.getFullName()
        );

        createUserTicketNotification(
                saved,
                "Ticket Assigned",
                "Your ticket " + safe(saved.getTicketCode()) +
                        " has been assigned to technician " + safe(technician.getFullName()) +
                        " and is now in progress.",
                "TICKET_UPDATE"
        );

        createTechnicianTicketNotification(
                saved,
                technician.getEmail(),
                technician.getFullName()
        );

        return saved;
    }

    @PatchMapping("/{id}/reject")
    public Ticket rejectTicket(
            @PathVariable Long id,
            @RequestParam String adminName,
            @RequestParam String adminEmail,
            @RequestParam String rejectionReason
    ) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        String oldStatus = ticket.getStatus();
        ticket.setStatus("REJECTED");
        ticket.setRejectionReason(rejectionReason);

        Ticket saved = ticketRepository.save(ticket);

        createHistory(
                saved.getId(),
                oldStatus,
                "REJECTED",
                adminName,
                adminEmail,
                "ADMIN",
                rejectionReason
        );

        createUserTicketNotification(
                saved,
                "Ticket Rejected",
                "Your ticket " + safe(saved.getTicketCode()) +
                        " has been rejected. Reason: " + safe(rejectionReason),
                "TICKET_UPDATE"
        );

        return saved;
    }

    @PatchMapping("/{id}/resolve")
    public Ticket resolveTicket(
            @PathVariable Long id,
            @RequestParam String technicianName,
            @RequestParam String technicianEmail,
            @RequestParam String resolutionNotes
    ) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        String oldStatus = ticket.getStatus();
        ticket.setStatus("RESOLVED");
        ticket.setResolutionNotes(resolutionNotes);

        Ticket saved = ticketRepository.save(ticket);

        createHistory(
                saved.getId(),
                oldStatus,
                "RESOLVED",
                technicianName,
                technicianEmail,
                "TECHNICIAN",
                resolutionNotes
        );

        createUserTicketNotification(
                saved,
                "Ticket Resolved",
                "Your ticket " + safe(saved.getTicketCode()) +
                        " has been resolved by technician " + safe(technicianName) +
                        ". Resolution: " + safe(resolutionNotes),
                "TICKET_UPDATE"
        );

        return saved;
    }

    @PatchMapping("/{id}/status")
    public Ticket updateTicketStatus(
            @PathVariable Long id,
            @RequestParam String newStatus,
            @RequestParam String changedByName,
            @RequestParam String changedByEmail,
            @RequestParam String changedByRole,
            @RequestParam(required = false) String note
    ) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        String normalized = newStatus.toUpperCase();
        if (!List.of("OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED").contains(normalized)) {
            throw new RuntimeException("Invalid status");
        }

        String oldStatus = ticket.getStatus();
        ticket.setStatus(normalized);

        Ticket saved = ticketRepository.save(ticket);

        createHistory(
                saved.getId(),
                oldStatus,
                normalized,
                changedByName,
                changedByEmail,
                changedByRole,
                note
        );

        createUserTicketNotification(
                saved,
                "Ticket Updated",
                "Your ticket " + safe(saved.getTicketCode()) +
                        " status was updated to " + normalized +
                        (note != null && !note.isBlank() ? ". Note: " + note : "."),
                "TICKET_UPDATE"
        );

        return saved;
    }

    @PostMapping("/{id}/comments")
    public TicketComment addComment(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String userName,
            @RequestParam String userEmail,
            @RequestParam String userRole,
            @RequestParam String commentText
    ) {
        ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (commentText == null || commentText.isBlank()) {
            throw new RuntimeException("Comment cannot be empty");
        }

        TicketComment comment = new TicketComment();
        comment.setTicketId(id);
        comment.setUserId(userId);
        comment.setUserName(userName);
        comment.setUserEmail(userEmail);
        comment.setUserRole(userRole);
        comment.setCommentText(commentText.trim());

        return ticketCommentRepository.save(comment);
    }

    @PutMapping("/comments/{commentId}")
    public TicketComment updateComment(
            @PathVariable Long commentId,
            @RequestParam String userEmail,
            @RequestParam String commentText
    ) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserEmail().equalsIgnoreCase(userEmail)) {
            throw new RuntimeException("You can only edit your own comments");
        }

        if (commentText == null || commentText.isBlank()) {
            throw new RuntimeException("Comment cannot be empty");
        }

        comment.setCommentText(commentText.trim());
        comment.setEdited(true);
        comment.setUpdatedAt(LocalDateTime.now());

        return ticketCommentRepository.save(comment);
    }

    @DeleteMapping("/comments/{commentId}")
    public Map<String, String> deleteComment(
            @PathVariable Long commentId,
            @RequestParam String userEmail
    ) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserEmail().equalsIgnoreCase(userEmail)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        ticketCommentRepository.delete(comment);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Comment deleted successfully");
        return response;
    }

    private void createAdminNotification(Ticket ticket) {
        Notification notification = new Notification();
        notification.setTitle("New Ticket Submitted");
        notification.setMessage(
                safe(ticket.getUserName()) +
                        " submitted a ticket " +
                        safe(ticket.getTicketCode()) +
                        " for " +
                        safe(ticket.getResourceLocation())
        );
        notification.setType("TICKET");
        notification.setTargetRole("ADMIN");
        notification.setRelatedId(ticket.getId());
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    private void createUserTicketNotification(
            Ticket ticket,
            String title,
            String message,
            String type
    ) {
        if (ticket.getUserEmail() == null || ticket.getUserEmail().isBlank()) {
            return;
        }

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setTargetRole("USER");
        notification.setTargetEmail(ticket.getUserEmail());
        notification.setRelatedId(ticket.getId());
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    private void createTechnicianTicketNotification(
            Ticket ticket,
            String technicianEmail,
            String technicianName
    ) {
        if (technicianEmail == null || technicianEmail.isBlank()) {
            return;
        }

        Notification notification = new Notification();
        notification.setTitle("New Ticket Assigned");
        notification.setMessage(
                "Ticket " + safe(ticket.getTicketCode()) +
                        " has been assigned to you. Location: " +
                        safe(ticket.getResourceLocation()) +
                        ", Priority: " + safe(ticket.getPriority()) +
                        ", Reported by: " + safe(ticket.getUserName())
        );
        notification.setType("TECHNICIAN_TICKET");
        notification.setTargetRole("TECHNICIAN");
        notification.setTargetEmail(technicianEmail);
        notification.setRelatedId(ticket.getId());
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    private void createHistory(
            Long ticketId,
            String oldStatus,
            String newStatus,
            String changedByName,
            String changedByEmail,
            String changedByRole,
            String note
    ) {
        TicketStatusHistory history = new TicketStatusHistory();
        history.setTicketId(ticketId);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedByName(changedByName);
        history.setChangedByEmail(changedByEmail);
        history.setChangedByRole(changedByRole);
        history.setNote(note);
        ticketStatusHistoryRepository.save(history);
    }

    private void validateTicketInputs(
            String category,
            String resourceLocation,
            String description,
            String priority,
            String contactName,
            String contactEmail
    ) {
        if (category == null || category.isBlank()) {
            throw new RuntimeException("Category is required");
        }
        if (resourceLocation == null || resourceLocation.isBlank()) {
            throw new RuntimeException("Resource / Location is required");
        }
        if (description == null || description.isBlank()) {
            throw new RuntimeException("Description is required");
        }
        if (priority == null || priority.isBlank()) {
            throw new RuntimeException("Priority is required");
        }
        if (contactName == null || contactName.isBlank()) {
            throw new RuntimeException("Contact name is required");
        }
        if (contactEmail == null || contactEmail.isBlank()) {
            throw new RuntimeException("Contact email is required");
        }
    }

    private void validateImage(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }
    }

    private String safe(String value) {
        return value != null && !value.isBlank() ? value : "-";
    }
}