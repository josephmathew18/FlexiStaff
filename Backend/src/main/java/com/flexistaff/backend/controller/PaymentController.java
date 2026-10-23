package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.request.CreatePaymentOrderRequest;
import com.flexistaff.backend.dto.request.VerifyPaymentRequest;
import com.flexistaff.backend.dto.response.*;
import com.flexistaff.backend.service.PaymentService;
import com.flexistaff.backend.utility.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final com.flexistaff.backend.config.RazorpayConfig razorpayConfig;

    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> createPaymentOrder(
            @Valid @RequestBody CreatePaymentOrderRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        PaymentOrderResponse response = paymentService.createPaymentOrder(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Razorpay payment order initialized successfully", response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentDto>> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        PaymentDto paymentDto = paymentService.verifyPayment(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Payment verified and recorded successfully", paymentDto));
    }

    @PostMapping(value = "/webhook", consumes = "*/*")
    public ResponseEntity<ApiResponse<String>> handleWebhook(
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature,
            @RequestBody String rawPayload) {
        log.info("Received Razorpay webhook callback (signature present: {})", signature != null);
        paymentService.processWebhook(rawPayload, signature);
        return ResponseEntity.ok(ApiResponse.success("Webhook processed successfully", "OK"));
    }

    @GetMapping("/project/{projectId}/summary")
    public ResponseEntity<ApiResponse<ProjectPaymentSummaryDto>> getProjectPaymentSummary(
            @PathVariable Long projectId) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        ProjectPaymentSummaryDto summary = paymentService.getProjectPaymentSummary(projectId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Project payment summary retrieved", summary));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getClientPaymentHistory(
            @RequestParam(required = false) Long clientId) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(clientId);
        List<PaymentDto> history = paymentService.getClientPaymentHistory(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Payment history retrieved", history));
    }

    @GetMapping("/{paymentId}/receipt")
    public ResponseEntity<ApiResponse<ReceiptDto>> getReceipt(
            @PathVariable Long paymentId) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        ReceiptDto receipt = paymentService.getReceipt(paymentId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Payment receipt generated", receipt));
    }

    @GetMapping("/config/key-id")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPublicKeyId() {
        return ResponseEntity.ok(ApiResponse.success("Razorpay public config",
                Collections.singletonMap("keyId", razorpayConfig.getKeyId())));
    }
}
