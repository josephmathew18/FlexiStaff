package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.response.AdminPaymentSummaryDto;
import com.flexistaff.backend.dto.response.TransactionDto;
import com.flexistaff.backend.entity.Payment;
import com.flexistaff.backend.entity.Payout;
import com.flexistaff.backend.entity.enums.PaymentStatus;
import com.flexistaff.backend.entity.enums.PayoutStatus;
import com.flexistaff.backend.entity.enums.PayoutType;
import com.flexistaff.backend.repository.PaymentRepository;
import com.flexistaff.backend.repository.PayoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPaymentService {

    private final PaymentRepository paymentRepository;
    private final PayoutRepository payoutRepository;

    @Transactional(readOnly = true)
    public AdminPaymentSummaryDto getAdminPaymentSummary() {
        BigDecimal clientPayments = paymentRepository.sumTotalSuccessfulPayments();
        if (clientPayments == null) clientPayments = BigDecimal.ZERO;

        BigDecimal paidToPros = payoutRepository.sumCompletedAmountByType(PayoutType.PROFESSIONAL_PAYOUT);
        if (paidToPros == null) paidToPros = BigDecimal.ZERO;

        BigDecimal paidToFreelancers = payoutRepository.sumCompletedAmountByType(PayoutType.FREELANCER_PAYOUT);
        if (paidToFreelancers == null) paidToFreelancers = BigDecimal.ZERO;

        BigDecimal pendingPayouts = payoutRepository.sumAmountByStatusIn(
                List.of(PayoutStatus.PENDING_APPROVAL, PayoutStatus.APPROVED, PayoutStatus.PROCESSING));
        if (pendingPayouts == null) pendingPayouts = BigDecimal.ZERO;

        long failedCount = paymentRepository.countByStatus(PaymentStatus.FAILED)
                + payoutRepository.countByStatus(PayoutStatus.FAILED);

        BigDecimal refunded = paymentRepository.sumTotalRefundedPayments();
        if (refunded == null) refunded = BigDecimal.ZERO;

        long completedPayoutsCount = payoutRepository.countByStatus(PayoutStatus.COMPLETED);

        long awaitingCount = payoutRepository.countByStatusIn(List.of(PayoutStatus.PENDING_APPROVAL, PayoutStatus.DRAFT))
                + paymentRepository.countByStatus(PaymentStatus.PENDING)
                + paymentRepository.countByStatus(PaymentStatus.CREATED);

        return AdminPaymentSummaryDto.builder()
                .totalClientPaymentsReceived(clientPayments.setScale(2, RoundingMode.HALF_UP))
                .totalPaidToProfessionals(paidToPros.setScale(2, RoundingMode.HALF_UP))
                .totalPaidToFreelancers(paidToFreelancers.setScale(2, RoundingMode.HALF_UP))
                .totalPendingPayouts(pendingPayouts.setScale(2, RoundingMode.HALF_UP))
                .totalFailedTransactions(failedCount)
                .totalRefundedClientPayments(refunded.setScale(2, RoundingMode.HALF_UP))
                .totalCompletedPayoutTransactions(completedPayoutsCount)
                .awaitingActionCount(awaitingCount)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getAllTransactions(String search, String type, String status, Long projectId, String startDate, String endDate) {
        List<TransactionDto> all = new ArrayList<>();

        // 1. Map client payments
        List<Payment> clientPayments = paymentRepository.findAllByOrderByCreatedAtDesc();
        for (Payment cp : clientPayments) {
            String txType = cp.getStatus() == PaymentStatus.REFUNDED ? "REFUND" : "CLIENT_PAYMENT";
            String clientName = cp.getClient() != null ? cp.getClient().getFullName() : "Client";
            String clientEmail = cp.getClient() != null ? cp.getClient().getEmail() : "";
            String orgName = cp.getClient() != null && cp.getClient().getClientProfile() != null
                    ? cp.getClient().getClientProfile().getCompanyName()
                    : "Client Organization";

            all.add(TransactionDto.builder()
                    .id("CP-" + cp.getId())
                    .rawId(cp.getId())
                    .transactionType(txType)
                    .partyName(clientName)
                    .partyEmail(clientEmail)
                    .partyRole("Client")
                    .organizationName(orgName)
                    .projectId(cp.getProject() != null ? cp.getProject().getId() : null)
                    .projectTitle(cp.getProject() != null ? cp.getProject().getTitle() : "Project")
                    .milestoneId(null)
                    .milestoneTitle(null)
                    .grossAmount(cp.getAmount().setScale(2, RoundingMode.HALF_UP))
                    .fee(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .deductions(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .netAmount(cp.getAmount().setScale(2, RoundingMode.HALF_UP))
                    .currency(cp.getCurrency())
                    .paymentMethod(cp.getPaymentMethod() != null ? cp.getPaymentMethod() : "Razorpay Checkout")
                    .gatewayReference(cp.getRazorpayPaymentId() != null ? cp.getRazorpayPaymentId() : cp.getRazorpayOrderId())
                    .receiptNumber(cp.getReceiptNumber())
                    .status(cp.getStatus().name())
                    .initiatedBy("Client: " + clientName)
                    .approvedBy("Razorpay Gateway Verified")
                    .transactionDate(cp.getPaidAt() != null ? cp.getPaidAt() : cp.getCreatedAt())
                    .completedDate(cp.getPaidAt())
                    .notes(cp.getNotes())
                    .failureReason(cp.getFailureReason())
                    .build());
        }

        // 2. Map talent payouts
        List<Payout> payouts = payoutRepository.findAll();
        for (Payout po : payouts) {
            String talentName = po.getRecipient() != null ? po.getRecipient().getFullName() : "Talent";
            String talentEmail = po.getRecipient() != null ? po.getRecipient().getEmail() : "";
            String partnerName = po.getPartnerCompany() != null ? po.getPartnerCompany().getCompanyName() : "Independent Freelancer";
            String roleStr = po.getPayoutType() == PayoutType.PROFESSIONAL_PAYOUT ? "Professional" : "Freelancer";

            all.add(TransactionDto.builder()
                    .id("PO-" + po.getId())
                    .rawId(po.getId())
                    .transactionType(po.getPayoutType().name())
                    .partyName(talentName)
                    .partyEmail(talentEmail)
                    .partyRole(roleStr)
                    .organizationName(partnerName)
                    .projectId(po.getProject() != null ? po.getProject().getId() : null)
                    .projectTitle(po.getProject() != null ? po.getProject().getTitle() : "Project")
                    .milestoneId(po.getMilestone() != null ? po.getMilestone().getId() : null)
                    .milestoneTitle(po.getMilestone() != null ? po.getMilestone().getTitle() : "Sprint Allocation")
                    .grossAmount(po.getGrossAmount().setScale(2, RoundingMode.HALF_UP))
                    .fee(po.getFee().setScale(2, RoundingMode.HALF_UP))
                    .deductions(po.getDeductions().setScale(2, RoundingMode.HALF_UP))
                    .netAmount(po.getNetAmount().setScale(2, RoundingMode.HALF_UP))
                    .currency(po.getCurrency())
                    .paymentMethod(po.getPayoutMethod() != null ? po.getPayoutMethod() : "Bank Transfer")
                    .gatewayReference(po.getGatewayTransactionId() != null ? po.getGatewayTransactionId() : "N/A")
                    .receiptNumber(po.getReferenceNumber())
                    .status(po.getStatus().name())
                    .initiatedBy(po.getInitiatedBy() != null ? po.getInitiatedBy().getFullName() : "Admin")
                    .approvedBy(po.getApprovedBy() != null ? po.getApprovedBy().getFullName() : null)
                    .transactionDate(po.getInitiatedAt() != null ? po.getInitiatedAt() : po.getCreatedAt())
                    .completedDate(po.getCompletedAt())
                    .notes(po.getNotes())
                    .failureReason(po.getFailureReason())
                    .build());
        }

        // 3. Filtering
        return all.stream()
                .filter(t -> {
                    if (type != null && !type.trim().isEmpty() && !type.equalsIgnoreCase("ALL")) {
                        if (!t.getTransactionType().equalsIgnoreCase(type.trim())) return false;
                    }
                    if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                        if (!t.getStatus().equalsIgnoreCase(status.trim())) return false;
                    }
                    if (projectId != null) {
                        if (t.getProjectId() == null || !t.getProjectId().equals(projectId)) return false;
                    }
                    if (startDate != null && !startDate.trim().isEmpty()) {
                        try {
                            LocalDate sDate = LocalDate.parse(startDate.trim());
                            if (t.getTransactionDate() != null && t.getTransactionDate().toLocalDate().isBefore(sDate)) {
                                return false;
                            }
                        } catch (Exception ignored) {}
                    }
                    if (endDate != null && !endDate.trim().isEmpty()) {
                        try {
                            LocalDate eDate = LocalDate.parse(endDate.trim());
                            if (t.getTransactionDate() != null && t.getTransactionDate().toLocalDate().isAfter(eDate)) {
                                return false;
                            }
                        } catch (Exception ignored) {}
                    }
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.trim().toLowerCase();
                        boolean match = (t.getId() != null && t.getId().toLowerCase().contains(s)) ||
                                (t.getPartyName() != null && t.getPartyName().toLowerCase().contains(s)) ||
                                (t.getPartyEmail() != null && t.getPartyEmail().toLowerCase().contains(s)) ||
                                (t.getProjectTitle() != null && t.getProjectTitle().toLowerCase().contains(s)) ||
                                (t.getReceiptNumber() != null && t.getReceiptNumber().toLowerCase().contains(s)) ||
                                (t.getGatewayReference() != null && t.getGatewayReference().toLowerCase().contains(s)) ||
                                (t.getOrganizationName() != null && t.getOrganizationName().toLowerCase().contains(s));
                        if (!match) return false;
                    }
                    return true;
                })
                .sorted((a, b) -> {
                    LocalDateTime dtA = a.getTransactionDate() != null ? a.getTransactionDate() : LocalDateTime.MIN;
                    LocalDateTime dtB = b.getTransactionDate() != null ? b.getTransactionDate() : LocalDateTime.MIN;
                    return dtB.compareTo(dtA);
                })
                .collect(Collectors.toList());
    }

    public String exportTransactionsCsv(String search, String type, String status, Long projectId, String startDate, String endDate) {
        List<TransactionDto> txs = getAllTransactions(search, type, status, projectId, startDate, endDate);
        StringBuilder sb = new StringBuilder();
        sb.append("Transaction ID,Type,Party Name,Party Email,Role,Organization,Project ID,Project Title,Gross Amount (INR),Fee (INR),Deductions (INR),Net Amount (INR),Method,Gateway Reference,Receipt Number,Status,Transaction Date,Completed Date,Initiated By,Approved By\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (TransactionDto t : txs) {
            sb.append(escapeCsv(t.getId())).append(",");
            sb.append(escapeCsv(t.getTransactionType())).append(",");
            sb.append(escapeCsv(t.getPartyName())).append(",");
            sb.append(escapeCsv(t.getPartyEmail())).append(",");
            sb.append(escapeCsv(t.getPartyRole())).append(",");
            sb.append(escapeCsv(t.getOrganizationName())).append(",");
            sb.append(t.getProjectId() != null ? t.getProjectId() : "").append(",");
            sb.append(escapeCsv(t.getProjectTitle())).append(",");
            sb.append(t.getGrossAmount()).append(",");
            sb.append(t.getFee()).append(",");
            sb.append(t.getDeductions()).append(",");
            sb.append(t.getNetAmount()).append(",");
            sb.append(escapeCsv(t.getPaymentMethod())).append(",");
            sb.append(escapeCsv(t.getGatewayReference())).append(",");
            sb.append(escapeCsv(t.getReceiptNumber())).append(",");
            sb.append(escapeCsv(t.getStatus())).append(",");
            sb.append(t.getTransactionDate() != null ? t.getTransactionDate().format(dtf) : "").append(",");
            sb.append(t.getCompletedDate() != null ? t.getCompletedDate().format(dtf) : "").append(",");
            sb.append(escapeCsv(t.getInitiatedBy())).append(",");
            sb.append(escapeCsv(t.getApprovedBy())).append("\n");
        }

        return sb.toString();
    }

    private String escapeCsv(String val) {
        if (val == null) return "\"\"";
        return "\"" + val.replace("\"", "\"\"") + "\"";
    }
}
