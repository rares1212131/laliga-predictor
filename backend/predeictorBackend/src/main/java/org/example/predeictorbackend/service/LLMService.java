package org.example.predeictorbackend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class LLMService {

    public String generateJournalistRationale(String home, String away, double hProb, double dProb, double aProb) {

        int h = (int) (hProb * 100);
        int d = (int) (dProb * 100);
        int a = (int) (aProb * 100);

        // Logic 1: Find the favorite
        String favorite = h > a ? home : away;
        int favProb = h > a ? h : a;
        int diff = Math.abs(h - a);

        StringBuilder rationale = new StringBuilder();

        if (diff < 5) {
            rationale.append(String.format(
                    "Our model predicts an extremely tight contest. %s (%d%%) and %s (%d%%) are virtually inseparable based on current form.",
                    home, h, away, a
            ));
        } else if (diff < 15) {
            // Slight Edge
            rationale.append(String.format(
                    "A competitive match is expected, but the model gives a slight tactical edge to %s (%d%%) over %s.",
                    favorite, favProb, (favorite.equals(home) ? away : home)
            ));
        } else if (diff < 30) {
            rationale.append(String.format(
                    "The data points to a clear advantage for %s. With a %d%% win probability, they are the statistical favorites to take the 3 points.",
                    favorite, favProb
            ));
        } else {
            rationale.append(String.format(
                    "The model indicates a dominant performance expected from %s (%d%%). %s faces a statistically difficult challenge here.",
                    favorite, favProb, (favorite.equals(home) ? away : home)
            ));
        }
        if (d >= 30) {
            rationale.append(String.format(" However, a high draw probability (%d%%) suggests a stalemate is a very possible outcome.", d));
        } else if (d <= 20) {
            rationale.append(" The low draw probability suggests a decisive result is likely.");
        }

        log.info("✅ Generated Logic-Based Rationale for {} vs {}", home, away);
        return rationale.toString();
    }
}