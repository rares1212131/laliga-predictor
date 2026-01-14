package org.example.predeictorbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "championship_odds_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChampionshipOddsHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    private Double probability;
    private Integer matchweek;
    private LocalDateTime createdAt;
}