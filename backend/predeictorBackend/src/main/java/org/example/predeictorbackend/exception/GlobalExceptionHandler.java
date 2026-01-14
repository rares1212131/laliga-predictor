package org.example.predeictorbackend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;
import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid email or password"));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleNotFound(NoSuchElementException ex) {
        String message = ex.getMessage();
        HttpStatus status = HttpStatus.UNAUTHORIZED;

        if (message != null && message.contains("security context")) {
            message = "User session expired. Please log in again.";
        } else if (message != null && message.contains("database")) {
            message = "User not found. Please check your credentials.";
        } else if (message != null && message.contains("Email cannot be extracted")) {
            message = "Invalid authentication token. Please log in again.";
        }

        return ResponseEntity.status(status)
                .body(Map.of("error", message != null ? message : "Authentication failed"));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuthError(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Authentication failed: " + ex.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        String message = ex.getMessage();
        HttpStatus status = HttpStatus.BAD_REQUEST;

        if (message != null && message.contains("expired")) {
            status = HttpStatus.UNAUTHORIZED;
        }
        else if (message != null && message.contains("Invalid") || message.contains("already used")) {
            status = HttpStatus.UNAUTHORIZED;
        }
        else if (message != null && message.contains("User with this email not found")) {
            message = "If that email exists, a reset link has been sent.";
            status = HttpStatus.OK;
        }
        else if (message != null && message.contains("Email is already in use")) {
            status = HttpStatus.CONFLICT;
        }

        return ResponseEntity.status(status)
                .body(Map.of("error", message != null ? message : "An error occurred"));
    }
}