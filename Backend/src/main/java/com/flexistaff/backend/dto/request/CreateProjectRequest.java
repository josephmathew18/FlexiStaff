package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateProjectRequest {

    @NotBlank(message = "Project title is required")
    private String title;

    private String description;

    private String requiredSkills;

    @NotNull(message = "Client ID is required")
    private Long clientId;

    private Long managerId;

    @PositiveOrZero(message = "Budget cannot be negative")
    private BigDecimal budget;

    @FutureOrPresent(message = "Start date cannot be in the past")
    private LocalDate startDate;

    private LocalDate endDate;
}
