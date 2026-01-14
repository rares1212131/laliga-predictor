package org.example.predeictorbackend.dto.response;

import lombok.*;
import org.example.predeictorbackend.entity.MatchStatus;
import java.time.LocalDateTime;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class AdminMatchResponse {
    private Long id;
    private Integer matchweek;
    private LocalDateTime utcDate;
    private String homeTeamName;
    private String awayTeamName;
    private Integer homeGoals;
    private Integer awayGoals;
    private String finalResult;
    private MatchStatus status;
    private boolean hasPrediction;
}