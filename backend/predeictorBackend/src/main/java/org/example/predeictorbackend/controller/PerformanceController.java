package org.example.predeictorbackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.dto.response.PerformanceResponse;
import org.example.predeictorbackend.service.PerformanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceService performanceService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PerformanceResponse> getAIAccuracy() {
        return ResponseEntity.ok(performanceService.getAIStats());
    }
}