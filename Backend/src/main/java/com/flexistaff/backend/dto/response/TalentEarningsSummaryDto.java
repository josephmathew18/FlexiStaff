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
public class TalentEarningsSummaryDto {
    private Long talentUserId;
    private String name;
    private String email;
    private String talentType; // "PROFESSIONAL" or "FREELANCER"
    private String partnerCompanyName;
    private BigDecimal totalApprovedEarnings;
    private BigDecimal totalPaid;
    private BigDecimal totalDeductions;
    private BigDecimal pendingPayout;
    private BigDecimal processingPayout;
    private BigDecimal failedPayout;
    private List<ProjectTalentEarningDto> projectEarnings;
    private List<PayoutDto> recentPayouts;
}
