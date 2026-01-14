package org.example.predeictorbackend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.predeictorbackend.entity.Match;
import org.example.predeictorbackend.entity.MatchStatus;
import org.example.predeictorbackend.entity.Team;
import org.example.predeictorbackend.repository.MatchRepository;
import org.example.predeictorbackend.repository.TeamRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchDataPopulator implements CommandLineRunner {

    private final TeamRepository teamRepository;
    private final MatchRepository matchRepository;

    @Override
    public void run(String... args) throws Exception {
        if (matchRepository.count() > 0) {
            log.info("Database already contains matches. Skipping initial import.");
            return;
        }

        log.info("🚀 Starting La Liga Full Season Import from 2526ALL.csv...");

        Map<String, Team> teamCache = new HashMap<>();
        ClassPathResource resource = new ClassPathResource("data/2526ALL.csv");

        try (BufferedReader br = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
            String line;
            br.readLine();

            int count = 0;
            while ((line = br.readLine()) != null) {
                String[] col = line.split(",");
                if (col.length < 5) continue;

                int mw = Integer.parseInt(col[2]);
                String homeName = col[3];
                String awayName = col[4];
                String resultStr = (col.length > 7) ? col[7] : "";
                Team homeTeam = getOrCreateTeam(homeName, teamCache);
                Team awayTeam = getOrCreateTeam(awayName, teamCache);
                LocalDateTime matchTime = LocalDateTime.of(
                        LocalDate.parse(col[0]),
                        LocalTime.parse(col[1])
                );
                Match match = Match.builder()
                        .homeTeam(homeTeam)
                        .awayTeam(awayTeam)
                        .matchweek(mw)
                        .utcDate(matchTime)
                        .build();

                if (mw <= 15 && resultStr.contains("-")) {
                    match.setStatus(MatchStatus.FINISHED);
                    String[] goals = resultStr.split("-");
                    int hGoals = Integer.parseInt(goals[0]);
                    int aGoals = Integer.parseInt(goals[1]);

                    match.setHomeGoals(hGoals);
                    match.setAwayGoals(aGoals);
                    if (hGoals > aGoals) match.setFinalResult("H");
                    else if (aGoals > hGoals) match.setFinalResult("A");
                    else match.setFinalResult("D");
                } else {
                    match.setStatus(MatchStatus.SCHEDULED);
                }

                matchRepository.save(match);
                count++;
            }
            log.info("✅ Import successful! Total matches in DB: {}", count);
        } catch (Exception e) {
            log.error("❌ Failed to import CSV data: {}", e.getMessage());
        }
    }

    private Team getOrCreateTeam(String name, Map<String, Team> cache) {
        if (cache.containsKey(name)) return cache.get(name);

        Team team = teamRepository.findByName(name)
                .orElseGet(() -> teamRepository.save(Team.builder().name(name).build()));

        cache.put(name, team);
        return team;
    }
}