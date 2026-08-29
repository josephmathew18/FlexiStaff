package com.flexistaff.backend.dto.response;

import com.flexistaff.backend.entity.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectDto {

    private Long id;
    private String title;
    private String description;

    private Long clientId;
    private String clientName;
    private String clientCompanyName;

    private Long managerId;
    private String managerName;

    private BigDecimal budget;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;

    private List<WorkforceAllocationDto> allocations;
    private List<MilestoneDto> milestones;
}
