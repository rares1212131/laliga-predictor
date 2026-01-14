package org.example.predeictorbackend.service;

import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.dto.request.UpdateMatchResultRequest;
import org.example.predeictorbackend.dto.response.AdminMatchResponse;
import org.example.predeictorbackend.entity.Match;
import org.example.predeictorbackend.entity.MatchStatus;
import org.example.predeictorbackend.repository.MatchRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminMatchService {

    private final MatchRepository matchRepository;
    private final ModelMapper modelMapper;

    public Page<AdminMatchResponse> getAllMatches(Integer matchweek, Pageable pageable) {
        Page<Match> matchPage;

        if (matchweek != null) {
            matchPage = matchRepository.findByMatchweek(matchweek, pageable);
        } else {
            matchPage = matchRepository.findAll(pageable);
        }

        return matchPage.map(match -> {
            AdminMatchResponse res = modelMapper.map(match, AdminMatchResponse.class);
            res.setHasPrediction(match.getPrediction() != null);
            return res;
        });
    }

    @Transactional
    public AdminMatchResponse updateMatchResult(Long matchId, UpdateMatchResultRequest request) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        match.setHomeGoals(request.getHomeGoals());
        match.setAwayGoals(request.getAwayGoals());
        match.setStatus(MatchStatus.FINISHED);

        if (request.getHomeGoals() > request.getAwayGoals()) match.setFinalResult("H");
        else if (request.getAwayGoals() > request.getHomeGoals()) match.setFinalResult("A");
        else match.setFinalResult("D");

        Match saved = matchRepository.save(match);
        return modelMapper.map(saved, AdminMatchResponse.class);
    }

    public boolean areAllMatchesFinished(Integer matchweek) {
        return matchRepository.findByMatchweekOrderByUtcDateAsc(matchweek)
                .stream().allMatch(m -> m.getStatus() == MatchStatus.FINISHED);
    }

    public boolean hasExistingPredictions(Integer matchweek) {
        return matchRepository.findByMatchweekOrderByUtcDateAsc(matchweek)
                .stream().anyMatch(m -> m.getPrediction() != null);
    }
}