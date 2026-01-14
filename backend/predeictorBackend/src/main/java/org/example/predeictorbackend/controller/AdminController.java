package org.example.predeictorbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.dto.request.UpdateMatchResultRequest;
import org.example.predeictorbackend.dto.response.AdminMatchResponse;
import org.example.predeictorbackend.dto.response.AdminUserResponse;
import org.example.predeictorbackend.entity.Match;
import org.example.predeictorbackend.repository.MatchRepository;
import org.example.predeictorbackend.repository.PredictionRepository;
import org.example.predeictorbackend.service.AdminMatchService;
import org.example.predeictorbackend.service.AdminUserService;
import org.example.predeictorbackend.service.AIService;
import org.example.predeictorbackend.service.LLMService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminMatchService adminMatchService;
    private final AdminUserService adminUserService;
    private final LLMService llmService;
    private final AIService aiService;
    private final MatchRepository matchRepository;
    private final PredictionRepository predictionRepository;
    @GetMapping("/matches")
    public ResponseEntity<Page<AdminMatchResponse>> getMatches(
            @RequestParam(required = false) Integer matchweek,
            Pageable pageable) {
        return ResponseEntity.ok(adminMatchService.getAllMatches(matchweek, pageable));
    }

    @PutMapping("/matches/{id}/result")
    public ResponseEntity<AdminMatchResponse> updateResult(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMatchResultRequest request) {
        return ResponseEntity.ok(adminMatchService.updateMatchResult(id, request));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @PutMapping("/users/{id}/roles")
    public ResponseEntity<?> updateRoles(@PathVariable Long id, @RequestBody List<String> roleNames) {
        adminUserService.updateUserRoles(id, roleNames);
        return ResponseEntity.ok(Map.of("message", "Roles updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/ai/check-predictions")
    public ResponseEntity<?> checkPredictions(@RequestParam Integer targetWeek) {
        boolean exists = adminMatchService.hasExistingPredictions(targetWeek);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @PostMapping("/ai/predict")
    public ResponseEntity<?> triggerAI(@RequestParam Integer lastCompletedWeek) {
        if (!adminMatchService.areAllMatchesFinished(lastCompletedWeek)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Results for week " + lastCompletedWeek + " missing."));
        }
        aiService.runPrediction(lastCompletedWeek + 1);
        aiService.runSeasonSimulation();
        List<Match> nextMatches = matchRepository.findByMatchweekOrderByUtcDateAsc(lastCompletedWeek + 1);
        for (Match m : nextMatches) {
            if (m.getPrediction() != null) {
                String smartRationale = llmService.generateJournalistRationale(
                        m.getHomeTeam().getName(), m.getAwayTeam().getName(),
                        m.getPrediction().getHomeWinProb(), m.getPrediction().getDrawProb(), m.getPrediction().getAwayWinProb()
                );
                m.getPrediction().setRationale(smartRationale);
                predictionRepository.save(m.getPrediction());
            }
        }
        return ResponseEntity.ok(Map.of("message", "AI Engine & Journalist AI finished."));
    }
}