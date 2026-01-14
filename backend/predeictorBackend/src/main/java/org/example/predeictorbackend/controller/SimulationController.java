package org.example.predeictorbackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.entity.ChampionshipOdds;
import org.example.predeictorbackend.entity.ChampionshipOddsHistory;
import org.example.predeictorbackend.entity.Match;
import org.example.predeictorbackend.entity.MatchStatus;
import org.example.predeictorbackend.repository.ChampionshipOddsHistoryRepository;
import org.example.predeictorbackend.repository.ChampionshipOddsRepository;
import org.example.predeictorbackend.repository.MatchRepository;
import org.example.predeictorbackend.repository.TeamRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/simulation")
@RequiredArgsConstructor
public class SimulationController {

    private final ChampionshipOddsRepository oddsRepository;
    private final ChampionshipOddsHistoryRepository historyRepository;
    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;

    @GetMapping("/leaderboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getLeaderboard() {
        List<Match> finishedMatches = matchRepository.findByStatusOrderByUtcDateAsc(MatchStatus.FINISHED);
        Map<String, Integer> currentPoints = new HashMap<>();

        teamRepository.findAll().forEach(t -> currentPoints.put(t.getName(), 0));

        for (Match m : finishedMatches) {
            String res = m.getFinalResult();
            if (res == null) continue;

            if ("H".equals(res)) {
                currentPoints.merge(m.getHomeTeam().getName(), 3, Integer::sum);
            } else if ("A".equals(res)) {
                currentPoints.merge(m.getAwayTeam().getName(), 3, Integer::sum);
            } else if ("D".equals(res)) {
                currentPoints.merge(m.getHomeTeam().getName(), 1, Integer::sum);
                currentPoints.merge(m.getAwayTeam().getName(), 1, Integer::sum);
            }
        }

        List<ChampionshipOdds> aiOdds = oddsRepository.findAllByOrderByProbabilityDesc();

        List<Map<String, Object>> response = aiOdds.stream().map(o -> {
            Map<String, Object> map = new HashMap<>();
            map.put("teamName", o.getTeam().getName());
            map.put("currentPoints", currentPoints.getOrDefault(o.getTeam().getName(), 0));
            map.put("winProbability", o.getProbability());
            map.put("prevProbability", o.getPreviousProbability());
            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getHistory() {
        List<ChampionshipOddsHistory> allHistory = historyRepository.findAll();

        Map<Integer, List<ChampionshipOddsHistory>> groupedByWeek = allHistory.stream()
                .collect(Collectors.groupingBy(ChampionshipOddsHistory::getMatchweek));
        List<Map<String, Object>> chartData = new ArrayList<>();

        List<Integer> sortedWeeks = new ArrayList<>(groupedByWeek.keySet());
        Collections.sort(sortedWeeks);

        for (Integer week : sortedWeeks) {
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("matchweek", week);

            for (ChampionshipOddsHistory record : groupedByWeek.get(week)) {
                dataPoint.put(record.getTeam().getName(), record.getProbability());
            }
            chartData.add(dataPoint);
        }

        return ResponseEntity.ok(chartData);
    }
}