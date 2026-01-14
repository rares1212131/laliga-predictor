package org.example.predeictorbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "championship_odds")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChampionshipOdds {

    @Id
    private Long teamId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "team_id")
    private Team team;

    private Double probability;
    private Double previousProbability;

    private LocalDateTime updatedAt;
}