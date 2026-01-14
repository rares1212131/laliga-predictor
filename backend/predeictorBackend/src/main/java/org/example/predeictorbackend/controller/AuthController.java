package org.example.predeictorbackend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.dto.request.LoginRequest;
import org.example.predeictorbackend.dto.request.PasswordResetRequest;
import org.example.predeictorbackend.dto.request.RegistrationRequest;
import org.example.predeictorbackend.dto.response.JwtResponse;
import org.example.predeictorbackend.dto.response.UserResponse;
import org.example.predeictorbackend.entity.User;
import org.example.predeictorbackend.repository.UserRepository;
import org.example.predeictorbackend.security.jwt.JwtUtils;
import org.example.predeictorbackend.security.user.UserDetailsImpl;
import org.example.predeictorbackend.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.WebUtils;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegistrationRequest request) {
        try {
            authService.registerUser(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("User registered successfully! Please check your email to verify your account.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        try {
            UserDetailsImpl userDetails = authService.loginUser(loginRequest);

            String accessToken = jwtUtils.generateTokenFromEmail(userDetails.getUsername());

            String refreshToken = UUID.randomUUID().toString();
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            user.setRefreshToken(refreshToken);
            user.setRefreshTokenExpiryDate(LocalDateTime.now().plusDays(7));
            userRepository.save(user);
            ResponseCookie refreshCookie = authService.generateRefreshCookie(refreshToken);
            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

            return ResponseEntity.ok(new JwtResponse(accessToken, userDetails.getId(), userDetails.getUsername(),
                    userDetails.getAuthorities().stream().map(a -> a.getAuthority()).toList()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        try {
            Cookie cookie = WebUtils.getCookie(request, "refreshToken");
            if (cookie == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Refresh token missing"));
            }

            String newAccessToken = authService.createAccessTokenFromRefreshToken(cookie.getValue());
            return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = authService.logoutUser();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        try {
            authService.verifyEmail(token);
            return ResponseEntity.ok("Email verified successfully! You can now log in.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            authService.handleForgotPassword(request.get("email"));
            return ResponseEntity.ok("If an account exists, a reset link has been sent.");
        } catch (Exception e) {
            return ResponseEntity.ok("If an account exists, a reset link has been sent.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        try {
            authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok("Password reset successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe() {
        try {
            return ResponseEntity.ok(authService.getAuthenticatedUser());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody org.example.predeictorbackend.dto.request.UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(request));
    }
}