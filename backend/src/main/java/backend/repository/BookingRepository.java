package backend.repository;

import backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByResourceIdAndBookingDateAndBookingTimeAndStatusIn(
            Long resourceId,
            String bookingDate,
            String bookingTime,
            List<String> statuses
    );

    List<Booking> findByResourceIdOrderByBookingDateAsc(Long resourceId);
}