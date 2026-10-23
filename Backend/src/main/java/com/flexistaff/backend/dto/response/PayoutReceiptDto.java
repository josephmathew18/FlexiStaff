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
public class PayoutReceiptDto {
    private String receiptNumber;
    private Long payoutId;
    private String payoutType; // "PROFESSIONAL_PAYOUT" or "FREELANCER_PAYOUT"
    private Long projectId;
    private String projectTitle;
    private Long milestoneId;
    private String milestoneTitle;
    private Long recipientId;
    private String recipientName;
    private String recipientEmail;
    private String recipientRole;
    private String partnerCompanyName;
    private BigDecimal grossAmount;
    private BigDecimal fee;
    private BigDecimal deductions;
    private BigDecimal netAmount;
    private String currency;
    private String payoutMethod;
    private String gatewayTransactionId;
    private String status;
    private LocalDateTime completedAt;
    private LocalDateTime issuedAt;
    private String issuedBy;
    private String notes;
}
