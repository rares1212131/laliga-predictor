package org.example.predeictorbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Prediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    private Double homeWinProb;
    private Double drawProb;
    private Double awayWinProb;


    private Double bttsProb;
    private Double over25Prob;

    private Double confidence;
    private Boolean upsetAlert;

    @Column(length = 1000)
    private String rationale;

    private LocalDateTime generatedAt;
}