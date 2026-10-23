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
public class TransactionDto {
    private String id; // e.g. "CP-1", "PO-1"
    private Long rawId;
    private String transactionType; // "CLIENT_PAYMENT", "PROFESSIONAL_PAYOUT", "FREELANCER_PAYOUT", "REFUND"
    private String partyName; // Client name or Professional / Freelancer name
    private String partyEmail;
    private String partyRole; // "Client", "Professional", "Freelancer"
    private String organizationName; // Client Company or Partner Company or "Independent"
    private Long projectId;
    private String projectTitle;
    private Long milestoneId;
    private String milestoneTitle;
    private BigDecimal grossAmount;
    private BigDecimal fee;
    private BigDecimal deductions;
    private BigDecimal netAmount;
    private String currency;
    private String paymentMethod;
    private String gatewayReference;
    private String receiptNumber;
    private String status; // "SUCCESS", "COMPLETED", "PENDING_APPROVAL", "APPROVED", "PROCESSING", "FAILED", "CANCELLED", "REFUNDED"
    private String initiatedBy;
    private String approvedBy;
    private LocalDateTime transactionDate;
    private LocalDateTime completedDate;
    private String notes;
    private String failureReason;
}
