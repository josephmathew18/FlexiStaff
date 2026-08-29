package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.dto.response.DashboardSummaryDto;
import com.flexistaff.backend.service.DashboardService;
import com.flexistaff.backend.utility.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getAdminDashboard() {
        DashboardSummaryDto summary = dashboardService.getAdminDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard metrics retrieved", summary));
    }

    @GetMapping("/manager")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getManagerDashboard() {
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow();
        DashboardSummaryDto summary = dashboardService.getManagerDashboardSummary(userId);
        return ResponseEntity.ok(ApiResponse.success("Manager dashboard metrics retrieved", summary));
    }

    @GetMapping("/client")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getClientDashboard() {
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow();
        DashboardSummaryDto summary = dashboardService.getClientDashboardSummary(userId);
        return ResponseEntity.ok(ApiResponse.success("Client dashboard metrics retrieved", summary));
    }

    @GetMapping("/professional")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROFESSIONAL')")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getProfessionalDashboard() {
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow();
        DashboardSummaryDto summary = dashboardService.getProfessionalDashboardSummary(userId);
        return ResponseEntity.ok(ApiResponse.success("Professional dashboard metrics retrieved", summary));
    }
}
