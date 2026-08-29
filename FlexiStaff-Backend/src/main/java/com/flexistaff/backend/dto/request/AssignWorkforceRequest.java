package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AssignWorkforceRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Professional User ID is required")
    private Long professionalId;

    private String roleInProject;

    private Integer allocatedHoursPerWeek;

    private BigDecimal billableRate;
}
