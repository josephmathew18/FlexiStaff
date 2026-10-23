package com.flexistaff.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligibleMilestoneDto {
    private Long milestoneId;
    private String title;
    private Double weightage;
    private String status;
    private Integer progressPercentage;
    private BigDecimal milestoneEarnings;
    private BigDecimal alreadyPaidForMilestone;
    private BigDecimal pendingForMilestone;
    private boolean approved;
}
