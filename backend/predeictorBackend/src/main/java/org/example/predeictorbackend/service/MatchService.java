package org.example.predeictorbackend.service;

import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.dto.response.MatchResponse;
import org.example.predeictorbackend.dto.response.PredictionResponse;
import org.example.predeictorbackend.entity.Match;
import org.example.predeictorbackend.repository.FanVoteRepository;
import org.example.predeictorbackend.repository.MatchRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final FanVoteRepository fanVoteRepository;
    private final ModelMapper modelMapper;

    @Transactional(readOnly = true)
    public List<MatchResponse> getMatchesByWeek(Integer week) {
        List<Match> matches = matchRepository.findByMatchweekOrderByUtcDateAsc(week);

        return matches.stream().map(match -> {
            MatchResponse res = modelMapper.map(match, MatchResponse.class);

            if (match.getPrediction() != null) {
                res.setPrediction(modelMapper.map(match.getPrediction(), PredictionResponse.class));
            }

            res.setHomeVotes(fanVoteRepository.countByMatchIdAndVotedResult(match.getId(), "H"));
            res.setDrawVotes(fanVoteRepository.countByMatchIdAndVotedResult(match.getId(), "D"));
            res.setAwayVotes(fanVoteRepository.countByMatchIdAndVotedResult(match.getId(), "A"));

            return res;
        }).collect(Collectors.toList());
    }
    public Integer getCurrentMatchweek() {
        return matchRepository.findFirstScheduledWeek().orElse(38);
    }
}