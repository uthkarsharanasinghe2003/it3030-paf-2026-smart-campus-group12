package backend.controller;

import backend.model.Notification;
import backend.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/admin")
    public List<Notification> getAdminNotifications() {
        return notificationRepository.findByTargetRoleOrderByCreatedAtDesc("ADMIN");
    }

    @GetMapping("/admin/unread-count")
    public Map<String, Long> getAdminUnreadCount() {
        Map<String, Long> response = new HashMap<>();
        response.put("count", notificationRepository.countByTargetRoleAndIsReadFalse("ADMIN"));
        return response;
    }

    @GetMapping("/user")
    public List<Notification> getUserNotifications(@RequestParam String email) {
        return notificationRepository.findByTargetEmailOrderByCreatedAtDesc(email);
    }

    @GetMapping("/user/unread-count")
    public Map<String, Long> getUserUnreadCount(@RequestParam String email) {
        Map<String, Long> response = new HashMap<>();
        response.put("count", notificationRepository.countByTargetEmailAndIsReadFalse(email));
        return response;
    }

    @GetMapping("/technician")
    public List<Notification> getTechnicianNotifications(@RequestParam String email) {
        return notificationRepository.findByTargetEmailOrderByCreatedAtDesc(email);
    }

    @GetMapping("/technician/unread-count")
    public Map<String, Long> getTechnicianUnreadCount(@RequestParam String email) {
        Map<String, Long> response = new HashMap<>();
        response.put("count", notificationRepository.countByTargetEmailAndIsReadFalse(email));
        return response;
    }

    @PatchMapping("/{id}/read")
    public Notification markNotificationAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @PatchMapping("/admin/read-all")
    public Map<String, String> markAllAdminNotificationsAsRead() {
        List<Notification> notifications =
                notificationRepository.findByTargetRoleOrderByCreatedAtDesc("ADMIN");

        for (Notification item : notifications) {
            item.setRead(true);
        }

        notificationRepository.saveAll(notifications);

        Map<String, String> response = new HashMap<>();
        response.put("message", "All admin notifications marked as read");
        return response;
    }

    @PatchMapping("/user/read-all")
    public Map<String, String> markAllUserNotificationsAsRead(@RequestParam String email) {
        List<Notification> notifications =
                notificationRepository.findByTargetEmailOrderByCreatedAtDesc(email);

        for (Notification item : notifications) {
            item.setRead(true);
        }

        notificationRepository.saveAll(notifications);

        Map<String, String> response = new HashMap<>();
        response.put("message", "All user notifications marked as read");
        return response;
    }

    @PatchMapping("/technician/read-all")
    public Map<String, String> markAllTechnicianNotificationsAsRead(@RequestParam String email) {
        List<Notification> notifications =
                notificationRepository.findByTargetEmailOrderByCreatedAtDesc(email);

        for (Notification item : notifications) {
            item.setRead(true);
        }

        notificationRepository.saveAll(notifications);

        Map<String, String> response = new HashMap<>();
        response.put("message", "All technician notifications marked as read");
        return response;
    }
}