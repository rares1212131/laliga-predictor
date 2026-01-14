package org.example.predeictorbackend.repository;

import org.example.predeictorbackend.entity.ChampionshipOddsHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChampionshipOddsHistoryRepository extends JpaRepository<ChampionshipOddsHistory, Long> {
}