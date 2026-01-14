package org.example.predeictorbackend.repository;

import org.example.predeictorbackend.entity.FanVote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FanVoteRepository extends JpaRepository<FanVote, Long> {

    Optional<FanVote> findByUserIdAndMatchId(Long userId, Long matchId);

    long countByMatchIdAndVotedResult(Long matchId, String result);
}