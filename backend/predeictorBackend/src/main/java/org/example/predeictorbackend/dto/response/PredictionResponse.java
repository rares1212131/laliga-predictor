// File: PredictionResponse.java
package org.example.predeictorbackend.dto.response;

import lombok.*;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class PredictionResponse {
    private Double homeWinProb;
    private Double drawProb;
    private Double awayWinProb;
    private Double bttsProb;
    private Double over25Prob;
    private Double confidence;
    private Boolean upsetAlert;
    private String rationale;
}