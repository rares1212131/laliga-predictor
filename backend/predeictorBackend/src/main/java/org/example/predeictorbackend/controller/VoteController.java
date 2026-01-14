package org.example.predeictorbackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.dto.request.VoteRequest;
import org.example.predeictorbackend.service.FanVoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {

    private final FanVoteService fanVoteService;

    @PostMapping
    public ResponseEntity<?> castVote(@RequestBody VoteRequest request, Principal principal) {
        fanVoteService.castVote(principal.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Vote submitted successfully"));
    }
}