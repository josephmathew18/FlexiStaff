package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

    @Min(value = 0, message = "Weightage cannot be negative")
    @Max(value = 100, message = "Weightage cannot exceed 100%")
    private Double weightage;
}
