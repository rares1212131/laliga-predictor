package org.example.predeictorbackend.dto.response;

import lombok.*;
import org.example.predeictorbackend.entity.MatchStatus;
import java.time.LocalDateTime;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class MatchResponse {
    private Long id;
    private Integer matchweek;
    private LocalDateTime utcDate;
    private String homeTeamName;
    private String awayTeamName;
    private Integer homeGoals;
    private Integer awayGoals;
    private String finalResult;
    private MatchStatus status;

    private PredictionResponse prediction;

    private Long homeVotes;
    private Long drawVotes;
    private Long awayVotes;
}