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
public class AdminPaymentSummaryDto {
    private BigDecimal totalClientPaymentsReceived;
    private BigDecimal totalPaidToProfessionals;
    private BigDecimal totalPaidToFreelancers;
    private BigDecimal totalPendingPayouts;
    private long totalFailedTransactions;
    private BigDecimal totalRefundedClientPayments;
    private long totalCompletedPayoutTransactions;
    private long awaitingActionCount;
}
