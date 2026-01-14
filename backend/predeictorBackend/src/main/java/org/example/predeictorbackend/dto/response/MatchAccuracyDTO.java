package org.example.predeictorbackend.dto.response;

import lombok.*;
import java.util.List;
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class MatchAccuracyDTO {
    private String matchName;
    private String aiPrediction;
    private String actualResult;
    private boolean correct;
}