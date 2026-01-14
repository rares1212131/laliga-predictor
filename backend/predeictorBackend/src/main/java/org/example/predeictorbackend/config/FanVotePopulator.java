package org.example.predeictorbackend.config;

import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.entity.*;
import org.example.predeictorbackend.repository.FanVoteRepository;
import org.example.predeictorbackend.repository.MatchRepository;
import org.example.predeictorbackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@org.springframework.core.annotation.Order(2)
public class FanVotePopulator implements CommandLineRunner {
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final FanVoteRepository fanVoteRepository;

    @Override
    public void run(String... args) {
        Integer currentWeek = matchRepository.findFirstScheduledWeek().orElse(1);

        List<Match> upcoming = matchRepository.findByStatusOrderByUtcDateAsc(MatchStatus.SCHEDULED);
        List<User> fans = userRepository.findAll().stream()
                .filter(u -> u.getEmail().startsWith("fan")).toList();

        for (Match m : upcoming) {
            if (!m.getMatchweek().equals(currentWeek)) continue;
            if (fanVoteRepository.countByMatchIdAndVotedResult(m.getId(), "H") > 0) continue;

            Prediction p = m.getPrediction();
            double hW = (p != null) ? p.getHomeWinProb() : 0.4;
            double dW = (p != null) ? p.getDrawProb() : 0.3;

            for (User fan : fans) {
                double chance = Math.random();
                String choice;
                if (chance < hW) choice = "H";
                else if (chance < hW + dW) choice = "D";
                else choice = "A";

                fanVoteRepository.save(FanVote.builder().user(fan).match(m).votedResult(choice).build());
            }
        }
    }
}