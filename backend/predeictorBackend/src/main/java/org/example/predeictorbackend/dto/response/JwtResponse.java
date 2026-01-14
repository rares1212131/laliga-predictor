package org.example.predeictorbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter @AllArgsConstructor
public class JwtResponse {
    private String accessToken;
    private Long id;
    private String email;
    private List<String> roles;
}