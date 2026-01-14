package org.example.predeictorbackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fan_votes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "match_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FanVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "match_id")
    private Match match;

    private String votedResult;
}