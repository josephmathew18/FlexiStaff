package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.request.CreateCompanyFeedbackRequest;
import com.flexistaff.backend.dto.request.CreateProfessionalFeedbackRequest;
import com.flexistaff.backend.dto.response.*;
import com.flexistaff.backend.exception.BadRequestException;
import com.flexistaff.backend.service.FeedbackService;
import com.flexistaff.backend.utility.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    // =========================================================================
    // CLIENT ENDPOINTS
    // =========================================================================

    @PostMapping("/company")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'CLIENT')")
    public ResponseEntity<ApiResponse<CompanyFeedbackDto>> submitCompanyFeedback(
            @Valid @RequestBody CreateCompanyFeedbackRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new BadRequestException("User must be authenticated to submit feedback."));

        CompanyFeedbackDto dto = feedbackService.submitCompanyFeedback(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thank you! Feedback for FlexiStaff AI submitted successfully.", dto));
    }

    @PostMapping("/professional")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'CLIENT')")
    public ResponseEntity<ApiResponse<ProfessionalFeedbackDto>> submitProfessionalFeedback(
            @Valid @RequestBody CreateProfessionalFeedbackRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new BadRequestException("User must be authenticated to submit feedback."));

        ProfessionalFeedbackDto dto = feedbackService.submitProfessionalFeedback(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Specialist rating and feedback submitted successfully.", dto));
    }

    @GetMapping("/client/eligibility")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'CLIENT')")
    public ResponseEntity<ApiResponse<List<ProjectFeedbackEligibilityDto>>> getClientFeedbackEligibility() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new BadRequestException("User must be authenticated to view feedback eligibility."));

        List<ProjectFeedbackEligibilityDto> list = feedbackService.getClientProjectsFeedbackEligibility(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Client feedback eligibility retrieved successfully", list));
    }

    @GetMapping("/client/my")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'CLIENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getClientSubmittedFeedbacks() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new BadRequestException("User must be authenticated to view submitted feedbacks."));

        Map<String, Object> data = feedbackService.getClientSubmittedFeedbacks(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Submitted reviews retrieved successfully", data));
    }

    // =========================================================================
    // SYSTEM ADMIN ENDPOINTS
    // =========================================================================

    @GetMapping("/admin/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<FeedbackSummaryDto>> getAdminFeedbackSummary() {
        FeedbackSummaryDto summary = feedbackService.getAdminFeedbackSummary();
        return ResponseEntity.ok(ApiResponse.success("Admin feedback summary retrieved successfully", summary));
    }

    @GetMapping("/admin/company")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<CompanyFeedbackDto>>> getAllCompanyFeedbacks() {
        List<CompanyFeedbackDto> list = feedbackService.getAllCompanyFeedbacks();
        return ResponseEntity.ok(ApiResponse.success("All FlexiStaff AI company reviews retrieved successfully", list));
    }

    @GetMapping("/admin/professionals")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ProfessionalFeedbackDto>>> getAllProfessionalFeedbacks(
            @RequestParam(required = false, defaultValue = "all") String filter) {
        List<ProfessionalFeedbackDto> list = feedbackService.getAllProfessionalFeedbacks(filter);
        return ResponseEntity.ok(ApiResponse.success("Professional reviews retrieved successfully", list));
    }

    // =========================================================================
    // PARTNER COMPANY ENDPOINTS (STRICT ENFORCEMENT)
    // =========================================================================

    @GetMapping("/partner/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_PARTNER', 'PARTNER')")
    public ResponseEntity<ApiResponse<PartnerFeedbackSummaryDto>> getPartnerFeedbackSummary() {
        Long partnerUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new BadRequestException("Partner company user must be authenticated."));

        PartnerFeedbackSummaryDto summary = feedbackService.getPartnerFeedbackSummary(partnerUserId);
        return ResponseEntity.ok(ApiResponse.success("Partner employee feedback summary retrieved successfully", summary));
    }

    @GetMapping("/partner/my-employees")
    @PreAuthorize("hasAnyAuthority('ROLE_PARTNER', 'PARTNER')")
    public ResponseEntity<ApiResponse<List<ProfessionalFeedbackDto>>> getPartnerEmployeeFeedbacks() {
        Long partnerUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new BadRequestException("Partner company user must be authenticated."));

        PartnerFeedbackSummaryDto summary = feedbackService.getPartnerFeedbackSummary(partnerUserId);
        return ResponseEntity.ok(ApiResponse.success("Partner employee reviews retrieved successfully", summary.getFeedbacks()));
    }
}
