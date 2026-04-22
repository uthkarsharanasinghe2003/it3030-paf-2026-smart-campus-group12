package backend.controller;

import backend.model.AdminUserUpsertRequest;
import backend.model.User;
import backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public List<User> getAllNormalUsers() {
        return userRepository.findByDeletedFalseAndRoleOrderByIdDesc("USER");
    }

    @GetMapping("/staff")
    public List<User> getAllStaffUsers() {
        return userRepository.findByDeletedFalseAndRoleInOrderByIdDesc(
                Arrays.asList("ADMIN", "TECHNICIAN")
        );
    }

    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @GetMapping("/staff/{id}")
    public User getStaffById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));

        if (!isStaffRole(user.getRole())) {
            throw new RuntimeException("Requested record is not a staff account");
        }

        return user;
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody AdminUserUpsertRequest request) {
        validateRequest(request, false);

        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedRole = normalizeRole(request.getRole());

        if (userRepository.existsByEmail(normalizedEmail)) {
            return ResponseEntity.badRequest().body("A user with this email already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setRole(normalizedRole);
        user.setAuthProvider("GOOGLE");
        user.setGoogleId(null);
        user.setActive(request.getActive() == null || request.getActive());
        user.setDeleted(!(request.getActive() == null || request.getActive()));

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@RequestBody AdminUserUpsertRequest request) {
        validateRequest(request, true);

        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedRole = normalizeRole(request.getRole());

        if (userRepository.existsByEmail(normalizedEmail)) {
            return ResponseEntity.badRequest().body("A staff/user with this email already exists");
        }

        User staff = new User();
        staff.setFullName(request.getFullName().trim());
        staff.setEmail(normalizedEmail);
        staff.setRole(normalizedRole);
        staff.setAuthProvider("GOOGLE");
        staff.setGoogleId(null);
        staff.setActive(request.getActive() == null || request.getActive());
        staff.setDeleted(!(request.getActive() == null || request.getActive()));

        User savedStaff = userRepository.save(staff);
        return ResponseEntity.ok(savedStaff);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody AdminUserUpsertRequest request) {
        validateRequest(request, false);

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedRole = normalizeRole(request.getRole());

        User userByEmail = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (userByEmail != null && !userByEmail.getId().equals(id)) {
            return ResponseEntity.badRequest().body("Another user already uses this email");
        }

        if (existingUser.getGoogleId() != null &&
                !existingUser.getEmail().equalsIgnoreCase(normalizedEmail)) {
            return ResponseEntity.badRequest().body("Cannot change email after Google account is linked");
        }

        existingUser.setFullName(request.getFullName().trim());
        existingUser.setEmail(normalizedEmail);
        existingUser.setRole(normalizedRole);

        boolean active = request.getActive() == null || request.getActive();
        existingUser.setActive(active);
        existingUser.setDeleted(!active);

        if (existingUser.getAuthProvider() == null || existingUser.getAuthProvider().isBlank()) {
            existingUser.setAuthProvider("GOOGLE");
        }

        User updatedUser = userRepository.save(existingUser);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody AdminUserUpsertRequest request) {
        validateRequest(request, true);

        User existingStaff = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));

        if (!isStaffRole(existingStaff.getRole())) {
            return ResponseEntity.badRequest().body("Requested record is not a staff account");
        }

        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedRole = normalizeRole(request.getRole());

        User userByEmail = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (userByEmail != null && !userByEmail.getId().equals(id)) {
            return ResponseEntity.badRequest().body("Another account already uses this email");
        }

        if (existingStaff.getGoogleId() != null &&
                !existingStaff.getEmail().equalsIgnoreCase(normalizedEmail)) {
            return ResponseEntity.badRequest().body("Cannot change email after Google account is linked");
        }

        existingStaff.setFullName(request.getFullName().trim());
        existingStaff.setEmail(normalizedEmail);
        existingStaff.setRole(normalizedRole);

        boolean active = request.getActive() == null || request.getActive();
        existingStaff.setActive(active);
        existingStaff.setDeleted(!active);

        if (existingStaff.getAuthProvider() == null || existingStaff.getAuthProvider().isBlank()) {
            existingStaff.setAuthProvider("GOOGLE");
        }

        User updatedStaff = userRepository.save(existingStaff);
        return ResponseEntity.ok(updatedStaff);
    }

    @PatchMapping("/users/{id}/deactivate")
    public User deactivateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setActive(false);
        user.setDeleted(true);

        return userRepository.save(user);
    }

    @PatchMapping("/users/{id}/activate")
    public User activateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setActive(true);
        user.setDeleted(false);

        return userRepository.save(user);
    }

    @PatchMapping("/staff/{id}/deactivate")
    public User deactivateStaff(@PathVariable Long id) {
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));

        if (!isStaffRole(staff.getRole())) {
            throw new RuntimeException("Requested record is not a staff account");
        }

        staff.setActive(false);
        staff.setDeleted(true);

        return userRepository.save(staff);
    }

    @PatchMapping("/staff/{id}/activate")
    public User activateStaff(@PathVariable Long id) {
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));

        if (!isStaffRole(staff.getRole())) {
            throw new RuntimeException("Requested record is not a staff account");
        }

        staff.setActive(true);
        staff.setDeleted(false);

        return userRepository.save(staff);
    }

    @PatchMapping("/users/self-delete")
    public ResponseEntity<?> deleteOwnAccount(
            @RequestParam Long id,
            @RequestParam String email
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isDeleted()) {
            return ResponseEntity.badRequest().body("This account is already deleted");
        }

        if (!"USER".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.badRequest().body("Only normal users can delete their own account here");
        }

        if (!user.getEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.badRequest().body("You can only delete your own account");
        }

        user.setActive(false);
        user.setDeleted(true);
        userRepository.save(user);

        return ResponseEntity.ok("Your account has been deleted successfully");
    }

    private void validateRequest(AdminUserUpsertRequest request, boolean staffOnly) {
        if (request == null) {
            throw new RuntimeException("Request body is missing");
        }

        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Full name is required");
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new RuntimeException("Invalid email address");
        }

        if (request.getRole() == null || request.getRole().trim().isEmpty()) {
            throw new RuntimeException("Role is required");
        }

        String normalizedRole = normalizeRole(request.getRole());

        if (staffOnly) {
            if (!isStaffRole(normalizedRole)) {
                throw new RuntimeException("Staff role must be ADMIN or TECHNICIAN");
            }
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRole(String role) {
        return role.trim().toUpperCase(Locale.ROOT);
    }

    private boolean isStaffRole(String role) {
        if (role == null) return false;
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        return normalized.equals("ADMIN") || normalized.equals("TECHNICIAN");
    }
}