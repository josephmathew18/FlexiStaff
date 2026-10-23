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
public class ProjectTalentEarningDto {
    private Long projectId;
    private String projectTitle;
    private String projectStatus;
    private BigDecimal agreedCompensation;
    private Double approvedMilestonePercentage;
    private BigDecimal approvedEarnings;
    private BigDecimal paidAmount;
    private BigDecimal pendingAmount;
}
