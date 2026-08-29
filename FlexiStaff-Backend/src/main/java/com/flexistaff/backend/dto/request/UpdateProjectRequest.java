package com.flexistaff.backend.dto.request;

import com.flexistaff.backend.entity.enums.ProjectStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateProjectRequest {

    private String title;
    private String description;
    private Long managerId;
    private BigDecimal budget;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
}
