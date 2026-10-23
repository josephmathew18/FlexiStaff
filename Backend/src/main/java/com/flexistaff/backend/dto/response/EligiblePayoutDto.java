package com.flexistaff.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligiblePayoutDto {
    private Long talentUserId;
    private Long freelancerId;
    private String name;
    private String email;
    private String talentType; // "PROFESSIONAL" or "FREELANCER"
    private Long partnerCompanyId;
    private String partnerCompanyName;
    private Long projectId;
    private String projectTitle;
    private String projectStatus;
    private Long allocationId;
    private String allocationStatus;
    private String roleInProject;
    private BigDecimal billableRate;
    private Integer allocatedHoursPerWeek;
    private BigDecimal agreedCompensation;
    private Double approvedMilestonePercentage;
    private BigDecimal approvedEarnings;
    private BigDecimal previouslyPaid;
    private BigDecimal pendingPayout;
    private boolean eligible;
    private String ineligibilityReason;
    private List<EligibleMilestoneDto> approvedMilestones;
}
