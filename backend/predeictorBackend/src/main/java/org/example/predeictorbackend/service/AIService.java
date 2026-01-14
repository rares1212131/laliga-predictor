package org.example.predeictorbackend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIService {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    public void runPrediction(Integer targetWeek) {
        String url = aiServiceUrl + "/predict-week";
        log.info("Sending Prediction Request to Python AI: " + url);

        try {
            Map<String, Integer> requestBody = new HashMap<>();
            requestBody.put("target_week", targetWeek);

            // Send POST request
            String response = restTemplate.postForObject(url, requestBody, String.class);
            log.info("Python AI Response: " + response);
        } catch (Exception e) {
            log.error("Failed to connect to Python AI Microservice. Is the Uvicorn server running?");
            log.error("Error: " + e.getMessage());
            throw new RuntimeException("AI Service Unavailable");
        }
    }

    public void runSeasonSimulation() {
        String url = aiServiceUrl + "/simulate-season";
        log.info("🎲 Sending Simulation Request to Python AI: " + url);

        try {
            String response = restTemplate.postForObject(url, null, String.class);
            log.info("Python Simulation Response: " + response);
        } catch (Exception e) {
            log.error("Failed to connect to Python AI Simulation.");
            log.error("Error: " + e.getMessage());
        }
    }
}