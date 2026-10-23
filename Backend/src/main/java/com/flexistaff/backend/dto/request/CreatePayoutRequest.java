package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePayoutRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Talent user ID is required")
    private Long talentUserId;

    private Long milestoneId;

    @NotNull(message = "Payout amount is required")
    @DecimalMin(value = "1.00", message = "Payout amount must be at least ₹1.00")
    private BigDecimal amount;

    private BigDecimal fee;

    private BigDecimal deductions;

    @NotBlank(message = "Payout method is required")
    private String payoutMethod; // e.g. "Bank Transfer (NEFT/RTGS)", "UPI", "Manual Wire", "RazorpayX"

    private String gatewayTransactionId; // Reference / UTR if already executed externally

    private String notes;

    private Boolean markAsCompleted; // If true, immediately mark status as COMPLETED

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}
