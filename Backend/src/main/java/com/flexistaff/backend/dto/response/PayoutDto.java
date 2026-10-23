package com.flexistaff.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutDto {
    private Long id;
    private Long projectId;
    private String projectTitle;
    private Long milestoneId;
    private String milestoneTitle;
    private Long recipientId;
    private String recipientName;
    private String recipientEmail;
    private String recipientRole;
    private String payoutType; // "PROFESSIONAL_PAYOUT" or "FREELANCER_PAYOUT"
    private Long partnerCompanyId;
    private String partnerCompanyName;
    private BigDecimal grossAmount;
    private BigDecimal fee;
    private BigDecimal deductions;
    private BigDecimal netAmount;
    private String currency;
    private String status;
    private String payoutMethod;
    private String referenceNumber;
    private String gatewayTransactionId;
    private String notes;
    private String failureReason;
    private String initiatedByName;
    private String approvedByName;
    private LocalDateTime initiatedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private String auditTrail;
}
