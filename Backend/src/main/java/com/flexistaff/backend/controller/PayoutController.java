package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.dto.response.PayoutDto;
import com.flexistaff.backend.dto.response.PayoutReceiptDto;
import com.flexistaff.backend.dto.response.TalentEarningsSummaryDto;
import com.flexistaff.backend.exception.UnauthorizedException;
import com.flexistaff.backend.service.PayoutService;
import com.flexistaff.backend.utility.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/payouts")
@RequiredArgsConstructor
public class PayoutController {

    private final PayoutService payoutService;

    @GetMapping("/my-earnings")
    public ResponseEntity<ApiResponse<TalentEarningsSummaryDto>> getMyEarnings() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required to view earnings"));
        TalentEarningsSummaryDto summary = payoutService.getTalentEarningsSummary(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Earnings summary retrieved successfully", summary));
    }

    @GetMapping("/my-history")
    public ResponseEntity<ApiResponse<List<PayoutDto>>> getMyPayoutHistory() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required to view payment history"));
        List<PayoutDto> history = payoutService.getTalentPayoutHistory(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Payout history retrieved successfully", history));
    }

    @GetMapping("/{id}/receipt")
    public ResponseEntity<ApiResponse<PayoutReceiptDto>> getPayoutReceipt(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        PayoutReceiptDto receipt = payoutService.getPayoutReceipt(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Payout receipt retrieved successfully", receipt));
    }
}
