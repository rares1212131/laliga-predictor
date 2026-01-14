package org.example.predeictorbackend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class VoteRequest {
    private Long matchId;
    private String choice;
}