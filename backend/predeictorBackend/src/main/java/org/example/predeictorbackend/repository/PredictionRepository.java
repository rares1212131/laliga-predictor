package org.example.predeictorbackend.repository;

import org.example.predeictorbackend.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    Optional<Prediction> findByMatchId(Long matchId);
}