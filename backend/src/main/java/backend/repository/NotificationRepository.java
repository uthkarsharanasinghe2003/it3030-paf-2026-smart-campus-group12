package backend.repository;

import backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByTargetRoleOrderByCreatedAtDesc(String targetRole);

    long countByTargetRoleAndIsReadFalse(String targetRole);

    List<Notification> findByTargetEmailOrderByCreatedAtDesc(String targetEmail);

    long countByTargetEmailAndIsReadFalse(String targetEmail);
}