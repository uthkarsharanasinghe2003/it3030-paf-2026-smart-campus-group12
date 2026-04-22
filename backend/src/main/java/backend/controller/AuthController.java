package backend.controller;

import backend.exception.GoogleAuthException;
import backend.model.GoogleAuthRequest;
import backend.model.User;
import backend.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Value("${google.client.id}")
    private String googleClientId;

    private static final String ADMIN_EMAIL = "akila.rathnayake1103@gmail.com";
    private static final String TECHNICIAN_EMAIL = "gayandisanayake1234567@gmail.com";

    @GetMapping("/test")
    public String testAuth() {
        return "Auth controller working";
    }

    @PostMapping("/google")
    public Map<String, Object> googleLogin(@RequestBody GoogleAuthRequest request) {
        if (request == null || request.getCredential() == null || request.getCredential().isBlank()) {
            throw new GoogleAuthException("Google credential is missing");
        }

        GoogleIdToken.Payload payload = verifyGoogleToken(request.getCredential());

        String email = payload.getEmail();
        Boolean emailVerified = payload.getEmailVerified();
        String fullName = (String) payload.get("name");
        String googleId = payload.getSubject();

        if (email == null || email.isBlank()) {
            throw new GoogleAuthException("Google email not found");
        }

        if (emailVerified == null || !emailVerified) {
            throw new GoogleAuthException("Google email is not verified");
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            if (user.isDeleted() || !user.isActive()) {
                throw new GoogleAuthException("Your account has been deactivated by admin");
            }

            user.setFullName(fullName != null ? fullName : user.getFullName());
            user.setGoogleId(googleId);

            if (user.getAuthProvider() == null || user.getAuthProvider().isBlank()) {
                user.setAuthProvider("GOOGLE");
            }

            if (user.getRole() == null || user.getRole().isBlank()) {
                user.setRole(getDefaultRoleByEmail(email));
            }

            user = userRepository.save(user);
        } else {
            User newUser = new User();
            newUser.setFullName(fullName != null ? fullName : "Google User");
            newUser.setEmail(email);
            newUser.setGoogleId(googleId);
            newUser.setAuthProvider("GOOGLE");
            newUser.setRole(getDefaultRoleByEmail(email));
            newUser.setActive(true);
            newUser.setDeleted(false);

            user = userRepository.save(newUser);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Google sign in successful");
        response.put("id", user.getId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("authProvider", user.getAuthProvider());
        response.put("role", user.getRole());
        response.put("active", user.isActive());
        response.put("deleted", user.isDeleted());

        return response;
    }

    private String getDefaultRoleByEmail(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        if (normalizedEmail.equals(ADMIN_EMAIL.toLowerCase())) {
            return "ADMIN";
        }

        if (normalizedEmail.equals(TECHNICIAN_EMAIL.toLowerCase())) {
            return "TECHNICIAN";
        }

        return "USER";
    }

    private GoogleIdToken.Payload verifyGoogleToken(String credential) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(credential);

            if (idToken == null) {
                throw new GoogleAuthException("Invalid Google token");
            }

            return idToken.getPayload();
        } catch (GeneralSecurityException | IOException e) {
            e.printStackTrace();
            throw new GoogleAuthException("Google token verification failed: " + e.getMessage());
        }
    }
}