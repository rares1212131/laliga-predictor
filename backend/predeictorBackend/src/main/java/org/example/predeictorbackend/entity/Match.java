package org.example.predeictorbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer matchweek;
    private LocalDateTime utcDate;

    @ManyToOne
    @JoinColumn(name = "home_team_id")
    private Team homeTeam;

    @ManyToOne
    @JoinColumn(name = "away_team_id")
    private Team awayTeam;

    private Integer homeGoals;
    private Integer awayGoals;
    private String finalResult;

    @Enumerated(EnumType.STRING)
    private MatchStatus status;

    @OneToOne(mappedBy = "match", cascade = CascadeType.ALL)
    private Prediction prediction;
}