package org.example.predeictorbackend.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class PerformanceResponse {
    private Double overallAccuracy;
    private Double bttsAccuracy;
    private Double over25Accuracy;
    private Double upsetSuccessRate;

    private Integer totalPredicted;
    private Integer totalCorrect;

    private List<MatchAccuracyDTO> recentResults;
}