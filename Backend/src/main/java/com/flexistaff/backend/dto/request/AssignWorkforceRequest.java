package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AssignWorkforceRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Professional User ID is required")
    private Long professionalId;

    private String roleInProject;

    @Min(value = 1, message = "Allocated hours must be at least 1")
    @Max(value = 168, message = "Allocated hours cannot exceed 168 per week")
    private Integer allocatedHoursPerWeek;

    @PositiveOrZero(message = "Billable rate cannot be negative")
    private BigDecimal billableRate;
}
