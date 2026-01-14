package org.example.predeictorbackend.repository;

import org.example.predeictorbackend.entity.ChampionshipOdds;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChampionshipOddsRepository extends JpaRepository<ChampionshipOdds, Long> {
    List<ChampionshipOdds> findAllByOrderByProbabilityDesc();
}