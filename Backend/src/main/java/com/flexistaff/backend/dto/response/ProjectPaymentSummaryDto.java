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
public class ProjectPaymentSummaryDto {

    private Long projectId;
    private String projectTitle;
    private String projectStatus;
    private BigDecimal totalAgreedCost;
    private BigDecimal totalPaid;
    private BigDecimal remainingBalance;
    private String paymentStatus; // "PAID", "PARTIALLY_PAID", "UNPAID", "NO_COST_AGREED"
    private Boolean isEligibleForPayment;
    private List<PaymentDto> payments;
}
