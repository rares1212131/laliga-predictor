package org.example.predeictorbackend.repository;

import org.example.predeictorbackend.entity.Match;
import org.example.predeictorbackend.entity.MatchStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByMatchweekOrderByUtcDateAsc(Integer matchweek);

    List<Match> findByStatusOrderByUtcDateAsc(MatchStatus status);
    Page<Match> findByMatchweek(Integer matchweek, Pageable pageable);

    @Query("SELECT m FROM Match m WHERE " +
            "((m.homeTeam.id = :t1 AND m.awayTeam.id = :t2) OR (m.homeTeam.id = :t2 AND m.awayTeam.id = :t1)) " +
            "AND m.matchweek < :currentWeek AND m.status = 'FINISHED'")
    Optional<Match> findFirstLeg(@Param("t1") Long t1, @Param("t2") Long t2, @Param("currentWeek") Integer currentWeek);

    @Query("SELECT m FROM Match m WHERE " +
            "(m.homeTeam.id = :teamId OR m.awayTeam.id = :teamId) " +
            "AND m.status = 'FINISHED' " +
            "ORDER BY m.utcDate DESC")
    List<Match> findTeamForm(@Param("teamId") Long teamId, Pageable pageable);
    @Query("SELECT MIN(m.matchweek) FROM Match m WHERE m.status = 'SCHEDULED'")
    Optional<Integer> findFirstScheduledWeek();
}