package backend.controller;

import backend.model.Booking;
import backend.model.Notification;
import backend.repository.BookingRepository;
import backend.repository.NotificationRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class BookingController {

    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    public BookingController(BookingRepository bookingRepository,
                             NotificationRepository notificationRepository,
                             JavaMailSender mailSender) {
        this.bookingRepository = bookingRepository;
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
    }

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        boolean alreadyBooked = bookingRepository.existsByResourceIdAndBookingDateAndBookingTimeAndStatusIn(
                booking.getResourceId(),
                booking.getBookingDate(),
                booking.getBookingTime(),
                Arrays.asList("PENDING", "APPROVED")
        );

        if (alreadyBooked) {
            throw new RuntimeException("This time slot is already booked or pending approval");
        }

        if (booking.getStatus() == null || booking.getStatus().isBlank()) {
            booking.setStatus("PENDING");
        }

        Booking savedBooking = bookingRepository.save(booking);
        createAdminNotification(savedBooking);

        return savedBooking;
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @GetMapping("/resource/{resourceId}")
    public List<Booking> getBookingsByResource(@PathVariable Long resourceId) {
        return bookingRepository.findByResourceIdOrderByBookingDateAsc(resourceId);
    }

    @PatchMapping("/{id}/status")
    public Booking updateBookingStatus(@PathVariable Long id, @RequestBody Booking request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        String newStatus = request.getStatus();

        if (newStatus == null || newStatus.isBlank()) {
            throw new RuntimeException("Status is required");
        }

        if (!newStatus.equals("PENDING") &&
                !newStatus.equals("APPROVED") &&
                !newStatus.equals("REJECTED")) {
            throw new RuntimeException("Invalid booking status");
        }

        booking.setStatus(newStatus);
        Booking updatedBooking = bookingRepository.save(booking);

        createUserBookingStatusNotification(updatedBooking); // <-- add this

        if ("APPROVED".equals(newStatus)) {
            sendBookingApprovedEmail(updatedBooking);
        } else if ("REJECTED".equals(newStatus)) {
            sendBookingRejectedEmail(updatedBooking);
        }

        return updatedBooking;
    }

    private void createAdminNotification(Booking savedBooking) {
        Notification notification = new Notification();
        notification.setTitle("New Booking Request");
        notification.setMessage(
                safeValue(savedBooking.getUserName()) +
                        " submitted a booking for " +
                        safeValue(savedBooking.getResourceName()) +
                        " on " +
                        safeValue(savedBooking.getBookingDate()) +
                        " at " +
                        safeValue(savedBooking.getBookingTime())
        );
        notification.setType("BOOKING");
        notification.setTargetRole("ADMIN");
        notification.setRelatedId(savedBooking.getId());
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    private void createUserBookingStatusNotification(Booking booking) {
        if (booking.getUserEmail() == null || booking.getUserEmail().isBlank()) {
            return;
        }

        Notification notification = new Notification();

        if ("APPROVED".equals(booking.getStatus())) {
            notification.setTitle("Booking Approved");
            notification.setMessage(
                    "Your booking for " + safeValue(booking.getResourceName()) +
                            " on " + safeValue(booking.getBookingDate()) +
                            " at " + safeValue(booking.getBookingTime()) +
                            " has been approved."
            );
        } else if ("REJECTED".equals(booking.getStatus())) {
            notification.setTitle("Booking Rejected");
            notification.setMessage(
                    "Your booking for " + safeValue(booking.getResourceName()) +
                            " on " + safeValue(booking.getBookingDate()) +
                            " at " + safeValue(booking.getBookingTime()) +
                            " has been rejected."
            );
        } else {
            notification.setTitle("Booking Status Updated");
            notification.setMessage(
                    "Your booking status has been updated to " + safeValue(booking.getStatus()) + "."
            );
        }

        notification.setType("BOOKING_STATUS");
        notification.setTargetRole("USER");
        notification.setTargetEmail(booking.getUserEmail());
        notification.setRelatedId(booking.getId());
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    private void sendBookingApprovedEmail(Booking booking) {
        if (booking.getUserEmail() == null || booking.getUserEmail().isBlank()) {
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(booking.getUserEmail());
            message.setSubject("Booking Approved");
            message.setText(
                    "Hello " + safeValue(booking.getUserName()) + ",\n\n" +
                            "Your booking has been approved.\n\n" +
                            "Resource: " + safeValue(booking.getResourceName()) + "\n" +
                            "Date: " + safeValue(booking.getBookingDate()) + "\n" +
                            "Time: " + safeValue(booking.getBookingTime()) + "\n\n" +
                            "Thank you."
            );

            mailSender.send(message);
        } catch (Exception e) {
            System.out.println("Failed to send approval email: " + e.getMessage());
        }
    }

    private void sendBookingRejectedEmail(Booking booking) {
        if (booking.getUserEmail() == null || booking.getUserEmail().isBlank()) {
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(booking.getUserEmail());
            message.setSubject("Booking Rejected");
            message.setText(
                    "Hello " + safeValue(booking.getUserName()) + ",\n\n" +
                            "Your booking has been rejected.\n\n" +
                            "Resource: " + safeValue(booking.getResourceName()) + "\n" +
                            "Date: " + safeValue(booking.getBookingDate()) + "\n" +
                            "Time: " + safeValue(booking.getBookingTime()) + "\n\n" +
                            "Please try another time slot or contact the admin for more details."
            );

            mailSender.send(message);
        } catch (Exception e) {
            System.out.println("Failed to send rejection email: " + e.getMessage());
        }
    }

    private String safeValue(String value) {
        return value != null && !value.isBlank() ? value : "-";
    }
}