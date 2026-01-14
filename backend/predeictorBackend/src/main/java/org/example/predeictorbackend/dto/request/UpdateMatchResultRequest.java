package org.example.predeictorbackend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdateMatchResultRequest {
    @NotNull @Min(0)
    private Integer homeGoals;
    @NotNull @Min(0)
    private Integer awayGoals;
}