package org.example.predeictorbackend.service;

import org.example.predeictorbackend.dto.request.LoginRequest;
import org.example.predeictorbackend.dto.request.PasswordResetRequest;
import org.example.predeictorbackend.dto.request.RegistrationRequest;
import org.example.predeictorbackend.dto.response.UserResponse;
import org.example.predeictorbackend.entity.AuthProvider;
import org.example.predeictorbackend.entity.Role;
import org.example.predeictorbackend.entity.User;
import org.example.predeictorbackend.repository.RoleRepository;
import org.example.predeictorbackend.repository.UserRepository;
import org.example.predeictorbackend.security.jwt.JwtUtils;
import org.example.predeictorbackend.security.user.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${jwt.refreshExpirationMs}")
    private int jwtRefreshExpirationMs;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, @Lazy AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils, EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
    }

    @Transactional
    public void registerUser(RegistrationRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalStateException("Error: Passwords do not match!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Error: Email is already in use!");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProvider.LOCAL);

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Error: Default role ROLE_USER not found."));
        user.setRoles(Set.of(userRole));

        user.setVerified(false);
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiryDate(LocalDateTime.now().plusHours(24));

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {}", savedUser.getEmail());

        // Send verification email
        String verificationLink = frontendUrl + "/verify-email?token=" + token;
        String emailBody = "Welcome to LaLiga Predictor!\n\n"
                + "Please click the link below to activate your account:\n"
                + verificationLink + "\n\n"
                + "This link will expire in 24 hours.";

        try {
            emailService.sendEmail(savedUser.getEmail(), "LaLiga Predictor Email Verification", emailBody);
            logger.info("Verification email sent to: {}", savedUser.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send verification email to {}: {}", savedUser.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again.");
        }
    }

    public UserDetailsImpl loginUser(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            return (UserDetailsImpl) authentication.getPrincipal();
        } catch (Exception e) {
            logger.error("Login failed for email: {}", loginRequest.getEmail());
            throw e;
        }
    }

    public ResponseCookie generateRefreshCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(jwtRefreshExpirationMs / 1000)
                .sameSite("None")
                .build();
    }

    @Transactional(readOnly = true)
    public String createAccessTokenFromRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            throw new RuntimeException("Refresh token cannot be empty.");
        }

        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (user.getRefreshTokenExpiryDate() != null &&
                user.getRefreshTokenExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token has expired. Please log in again.");
        }

        return jwtUtils.generateTokenFromEmail(user.getEmail());
    }

    @Transactional(readOnly = true)
    public UserResponse getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("No user found in security context");
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found in database"));

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return new UserResponse(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), roles);
    }

    @Transactional
    public void verifyEmail(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Token cannot be empty.");
        }

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or already used token."));

        if (user.getVerificationTokenExpiryDate() != null &&
                user.getVerificationTokenExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired.");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiryDate(null);
        userRepository.save(user);
        logger.info("Email verified successfully for user: {}", user.getEmail());
    }

    @Transactional
    public void handleForgotPassword(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email cannot be empty.");
        }

        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new RuntimeException("User with this email not found."));

        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setResetTokenExpiryDate(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        String link = frontendUrl + "/reset-password?token=" + token;
        String emailBody = "You have requested to reset your password.\n\n"
                + "Please click the link below to set a new password:\n"
                + link + "\n\n"
                + "If you did not request this, please ignore this email. This link will expire in 1 hour.";

        try {
            emailService.sendEmail(user.getEmail(), "LaLiga Predictor Password Reset Request", emailBody);
            logger.info("Password reset email sent to: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to send password reset email. Please try again.");
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Token cannot be empty.");
        }

        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or already used token."));

        if (user.getResetTokenExpiryDate() != null &&
                user.getResetTokenExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Password reset token has expired.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setResetTokenExpiryDate(null);
        userRepository.save(user);
        logger.info("Password reset successfully for user: {}", user.getEmail());
    }

    @Transactional
    public ResponseCookie logoutUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            userRepository.findByEmail(auth.getName()).ifPresent(user -> {
                user.setRefreshToken(null);
                user.setRefreshTokenExpiryDate(null);
                userRepository.save(user);
            });
        }

        return ResponseCookie.from("refreshToken", "")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
    }

    @Transactional
    public UserResponse updateProfile(org.example.predeictorbackend.dto.request.UpdateProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        User updatedUser = userRepository.save(user);

        List<String> roles = updatedUser.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return new UserResponse(updatedUser.getId(), updatedUser.getFirstName(), updatedUser.getLastName(), updatedUser.getEmail(), roles);
    }
}