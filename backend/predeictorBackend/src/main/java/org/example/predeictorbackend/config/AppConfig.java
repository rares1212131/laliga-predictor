package org.example.predeictorbackend.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        mapper.typeMap(org.example.predeictorbackend.entity.Match.class,
                        org.example.predeictorbackend.dto.response.AdminMatchResponse.class)
                .addMappings(m -> {
                    m.map(src -> src.getHomeTeam().getName(), org.example.predeictorbackend.dto.response.AdminMatchResponse::setHomeTeamName);
                    m.map(src -> src.getAwayTeam().getName(), org.example.predeictorbackend.dto.response.AdminMatchResponse::setAwayTeamName);
                });

        mapper.typeMap(org.example.predeictorbackend.entity.Match.class,
                        org.example.predeictorbackend.dto.response.MatchResponse.class)
                .addMappings(m -> {
                    m.map(src -> src.getHomeTeam().getName(), org.example.predeictorbackend.dto.response.MatchResponse::setHomeTeamName);
                    m.map(src -> src.getAwayTeam().getName(), org.example.predeictorbackend.dto.response.MatchResponse::setAwayTeamName);
                });

        return mapper;
    }
}