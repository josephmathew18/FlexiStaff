package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateMilestoneRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Milestone title is required")
    private String title;

    private String description;

    private LocalDate dueDate;

    private Double weightage;
}
