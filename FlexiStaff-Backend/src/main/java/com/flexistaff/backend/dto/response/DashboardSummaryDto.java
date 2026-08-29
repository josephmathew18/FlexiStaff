package com.flexistaff.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryDto {

    private String userRole;
    private long totalProjects;
    private long activeProjects;
    private long completedProjects;
    private long totalUsers;
    private long totalProfessionals;
    private long totalClients;

    private BigDecimal totalBudgetOrSpend;
    private Double overallProgressPercentage;

    private List<ProjectDto> recentProjects;
    private List<WorkforceAllocationDto> recentAllocations;
}
