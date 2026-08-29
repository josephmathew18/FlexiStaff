package com.flexistaff.backend.dto.response;

import com.flexistaff.backend.entity.enums.MilestoneStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MilestoneDto {

    private Long id;
    private Long projectId;
    private String title;
    private String description;
    private LocalDate dueDate;
    private Integer progressPercentage;
    private MilestoneStatus status;
    private Double weightage;
    private LocalDateTime createdAt;
}
