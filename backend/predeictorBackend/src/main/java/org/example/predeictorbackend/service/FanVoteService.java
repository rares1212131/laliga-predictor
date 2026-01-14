package org.example.predeictorbackend.service;

import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.dto.request.VoteRequest;
import org.example.predeictorbackend.entity.FanVote;
import org.example.predeictorbackend.entity.Match;
import org.example.predeictorbackend.entity.User;
import org.example.predeictorbackend.repository.FanVoteRepository;
import org.example.predeictorbackend.repository.MatchRepository;
import org.example.predeictorbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FanVoteService {
    private final FanVoteRepository fanVoteRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;

    @Transactional
    public void castVote(String userEmail, VoteRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Match match = matchRepository.findById(request.getMatchId())
                .orElseThrow(() -> new RuntimeException("Match not found"));

        FanVote vote = fanVoteRepository.findByUserIdAndMatchId(user.getId(), match.getId())
                .orElse(FanVote.builder().user(user).match(match).build());

        vote.setVotedResult(request.getChoice());
        fanVoteRepository.save(vote);
    }
}