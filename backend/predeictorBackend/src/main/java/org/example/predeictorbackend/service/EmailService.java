package org.example.predeictorbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final RestTemplate restTemplate;

    @Value("${brevo.api.key}")
    private String apiKey;

    private final String brevoApiUrl = "https://api.brevo.com/v3/smtp/email";
    private final String senderEmail = "rrspld@gmail.com";
    private final String senderName = "LaLiga Predictor";

    public void sendEmail(String to, String subject, String htmlContent) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        Map<String, Object> requestBody = Map.of(
                "sender", Map.of("name", senderName, "email", senderEmail),
                "to", List.of(Map.of("email", to)),
                "subject", subject,
                "htmlContent", htmlContent
        );

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            System.out.println("📧 Sending email to " + to);
            ResponseEntity<String> response = restTemplate.postForEntity(brevoApiUrl, requestEntity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("✅ Email sent successfully via Brevo API to " + to);
            } else {
                System.err.println("❌ Failed to send email. Brevo API responded with status: " + response.getStatusCode() + " and body: " + response.getBody());
                throw new RuntimeException("Email delivery failed: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("❌ Error sending email via Brevo API: " + e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }
}