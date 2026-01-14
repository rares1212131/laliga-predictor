package org.example.predeictorbackend.service;

import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.dto.response.MatchAccuracyDTO;
import org.example.predeictorbackend.dto.response.PerformanceResponse;
import org.example.predeictorbackend.entity.Match;
import org.example.predeictorbackend.entity.MatchStatus;
import org.example.predeictorbackend.entity.Prediction;
import org.example.predeictorbackend.repository.MatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceService {

    private final MatchRepository matchRepository;

    @Transactional(readOnly = true)
    public PerformanceResponse getAIStats() {
        List<Match> finishedMatches = matchRepository.findByStatusOrderByUtcDateAsc(MatchStatus.FINISHED);

        int total = 0, outcomeHits = 0;
        int bttsTotal = 0, bttsHits = 0;
        int overTotal = 0, overHits = 0;
        int upsetTotal = 0, upsetHits = 0;

        List<MatchAccuracyDTO> results = new ArrayList<>();

        for (Match m : finishedMatches) {
            Prediction p = m.getPrediction();
            if (p == null || m.getFinalResult() == null) continue;

            total++;

            String predictedOutcome = getHighestProbOutcome(p);
            boolean outcomeCorrect = predictedOutcome.equals(m.getFinalResult());
            if (outcomeCorrect) outcomeHits++;

            boolean actualBTTS = m.getHomeGoals() > 0 && m.getAwayGoals() > 0;
            boolean predictedBTTS = p.getBttsProb() > 0.5;
            bttsTotal++;
            if (actualBTTS == predictedBTTS) bttsHits++;

            boolean actualOver = (m.getHomeGoals() + m.getAwayGoals()) >= 3;
            boolean predictedOver = p.getOver25Prob() > 0.5;
            overTotal++;
            if (actualOver == predictedOver) overHits++;

            if (Boolean.TRUE.equals(p.getUpsetAlert())) {
                upsetTotal++;
                if (outcomeCorrect) upsetHits++;
            }

            results.add(new MatchAccuracyDTO(
                    m.getHomeTeam().getName() + " vs " + m.getAwayTeam().getName(),
                    predictedOutcome,
                    m.getFinalResult(),
                    outcomeCorrect
            ));
        }

        return PerformanceResponse.builder()
                .overallAccuracy(calculatePercent(outcomeHits, total))
                .bttsAccuracy(calculatePercent(bttsHits, bttsTotal))
                .over25Accuracy(calculatePercent(overHits, overTotal))
                .upsetSuccessRate(calculatePercent(upsetHits, upsetTotal))
                .totalPredicted(total)
                .totalCorrect(outcomeHits)
                .recentResults(results)
                .build();
    }

    private double calculatePercent(int hits, int total) {
        return total > 0 ? (double) hits / total * 100 : 0.0;
    }

    private String getHighestProbOutcome(Prediction p) {
        double h = p.getHomeWinProb();
        double d = p.getDrawProb();
        double a = p.getAwayWinProb();
        if (h >= d && h >= a) return "H";
        if (a >= h && a >= d) return "A";
        return "D";
    }
}