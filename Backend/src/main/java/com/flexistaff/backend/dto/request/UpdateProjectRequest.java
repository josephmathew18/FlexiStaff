package com.flexistaff.backend.dto.request;

import com.flexistaff.backend.entity.enums.ProjectStatus;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateProjectRequest {

    private String title;
    private String description;
    private Long managerId;

    @PositiveOrZero(message = "Budget cannot be negative")
    private BigDecimal budget;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
}
