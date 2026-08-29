package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.request.CreateMilestoneRequest;
import com.flexistaff.backend.dto.request.UpdateMilestoneProgressRequest;
import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.dto.response.MilestoneDto;
import com.flexistaff.backend.service.MilestoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<MilestoneDto>> createMilestone(
            @Valid @RequestBody CreateMilestoneRequest request) {
        MilestoneDto created = milestoneService.createMilestone(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Milestone created successfully", created));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<MilestoneDto>>> getMilestonesByProject(@PathVariable Long projectId) {
        List<MilestoneDto> milestones = milestoneService.getMilestonesByProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("Project milestones retrieved", milestones));
    }

    @PatchMapping("/{milestoneId}/progress")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_PROFESSIONAL')")
    public ResponseEntity<ApiResponse<MilestoneDto>> updateProgress(
            @PathVariable Long milestoneId,
            @Valid @RequestBody UpdateMilestoneProgressRequest request) {
        MilestoneDto updated = milestoneService.updateMilestoneProgress(milestoneId, request);
        return ResponseEntity.ok(ApiResponse.success("Milestone progress updated successfully", updated));
    }
}
