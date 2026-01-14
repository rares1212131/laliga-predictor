package org.example.predeictorbackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.dto.response.MatchResponse;
import org.example.predeictorbackend.dto.response.PredictionResponse;
import org.example.predeictorbackend.entity.Match;
import org.example.predeictorbackend.entity.User;
import org.example.predeictorbackend.repository.FanVoteRepository;
import org.example.predeictorbackend.repository.MatchRepository;
import org.example.predeictorbackend.repository.UserRepository;
import org.example.predeictorbackend.service.MatchService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;
    private final MatchRepository matchRepository;
    private final ModelMapper modelMapper;
    private final FanVoteRepository fanVoteRepository;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MatchResponse>> getFixtures(@RequestParam Integer week) {
        return ResponseEntity.ok(matchService.getMatchesByWeek(week));
    }

    @GetMapping("/{id}/details")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getMatchDetails(@PathVariable Long id, Principal principal) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", match.getId());
        response.put("homeTeamName", match.getHomeTeam().getName());
        response.put("awayTeamName", match.getAwayTeam().getName());
        response.put("homeGoals", match.getHomeGoals());
        response.put("awayGoals", match.getAwayGoals());
        response.put("finalResult", match.getFinalResult());
        response.put("status", match.getStatus().toString());
        response.put("matchweek", match.getMatchweek());
        response.put("utcDate", match.getUtcDate());

        response.put("homeVotes", fanVoteRepository.countByMatchIdAndVotedResult(id, "H"));
        response.put("drawVotes", fanVoteRepository.countByMatchIdAndVotedResult(id, "D"));
        response.put("awayVotes", fanVoteRepository.countByMatchIdAndVotedResult(id, "A"));

        User currentUser = userRepository.findByEmail(principal.getName()).orElse(null);
        if (currentUser != null) {
            boolean hasVoted = fanVoteRepository.findByUserIdAndMatchId(currentUser.getId(), id).isPresent();
            response.put("userHasVoted", hasVoted);
        }

        response.put("homeForm", matchRepository.findTeamForm(match.getHomeTeam().getId(), PageRequest.of(0, 5))
                .stream().map(m -> modelMapper.map(m, MatchResponse.class)).toList());
        response.put("awayForm", matchRepository.findTeamForm(match.getAwayTeam().getId(), PageRequest.of(0, 5))
                .stream().map(m -> modelMapper.map(m, MatchResponse.class)).toList());

        if (match.getPrediction() != null) {
            response.put("prediction", modelMapper.map(match.getPrediction(), PredictionResponse.class));
        }

        return ResponseEntity.ok(response);
    }
    @GetMapping("/current-week")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Integer> getCurrentWeek() {
        return ResponseEntity.ok(matchService.getCurrentMatchweek());
    }
}