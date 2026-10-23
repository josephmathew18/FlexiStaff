package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.request.CreatePayoutRequest;
import com.flexistaff.backend.dto.request.ExecutePayoutRequest;
import com.flexistaff.backend.dto.response.*;
import com.flexistaff.backend.service.AdminPaymentService;
import com.flexistaff.backend.service.PayoutService;
import com.flexistaff.backend.utility.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;
    private final PayoutService payoutService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AdminPaymentSummaryDto>> getPaymentSummary() {
        AdminPaymentSummaryDto summary = adminPaymentService.getAdminPaymentSummary();
        return ResponseEntity.ok(ApiResponse.success("Admin payment summary retrieved successfully", summary));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionDto>>> getTransactions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<TransactionDto> txs = adminPaymentService.getAllTransactions(search, type, status, projectId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully", txs));
    }

    @GetMapping("/export-csv")
    public ResponseEntity<byte[]> exportTransactionsCsv(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        String csvData = adminPaymentService.exportTransactionsCsv(search, type, status, projectId, startDate, endDate);
        byte[] output = csvData.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"flexistaff_transactions.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(output);
    }

    @GetMapping("/payouts/eligible")
    public ResponseEntity<ApiResponse<List<EligiblePayoutDto>>> getEligiblePayouts(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String talentType) {
        List<EligiblePayoutDto> eligible = payoutService.calculateEligiblePayouts(projectId, talentType);
        return ResponseEntity.ok(ApiResponse.success("Eligible payouts calculated successfully", eligible));
    }

    @PostMapping("/payouts/create-order")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> createPayoutOrder(
            @Valid @RequestBody CreatePayoutRequest request) {
        Long adminUserId = SecurityUtils.getCurrentUserId().orElse(null);
        PaymentOrderResponse order = payoutService.createPayoutRazorpayOrder(request, adminUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Razorpay payout order created successfully", order));
    }

    @PostMapping("/payouts")
    public ResponseEntity<ApiResponse<PayoutDto>> createPayout(
            @Valid @RequestBody CreatePayoutRequest request) {
        Long adminUserId = SecurityUtils.getCurrentUserId().orElse(null);
        PayoutDto payout = payoutService.createPayout(request, adminUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payout initiated successfully", payout));
    }

    @PutMapping("/payouts/{id}/approve")
    public ResponseEntity<ApiResponse<PayoutDto>> approvePayout(@PathVariable Long id) {
        Long adminUserId = SecurityUtils.getCurrentUserId().orElse(null);
        PayoutDto payout = payoutService.approvePayout(id, adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Payout approved successfully", payout));
    }

    @PostMapping("/payouts/{id}/execute")
    public ResponseEntity<ApiResponse<PayoutDto>> executePayout(
            @PathVariable Long id,
            @Valid @RequestBody ExecutePayoutRequest request) {
        Long adminUserId = SecurityUtils.getCurrentUserId().orElse(null);
        PayoutDto payout = payoutService.executePayout(id, request, adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Payout executed successfully", payout));
    }

    @PutMapping("/payouts/{id}/cancel")
    public ResponseEntity<ApiResponse<PayoutDto>> cancelPayout(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        Long adminUserId = SecurityUtils.getCurrentUserId().orElse(null);
        String reason = body != null ? body.get("reason") : "Cancelled by admin";
        PayoutDto payout = payoutService.cancelPayout(id, reason, adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Payout cancelled successfully", payout));
    }

    @GetMapping("/payouts/{id}")
    public ResponseEntity<ApiResponse<PayoutDto>> getPayoutById(@PathVariable Long id) {
        PayoutDto payout = payoutService.getPayoutById(id);
        return ResponseEntity.ok(ApiResponse.success("Payout retrieved successfully", payout));
    }
}
