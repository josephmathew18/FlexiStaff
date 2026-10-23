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
    public ResponseEntity<ApiResponse<MilestoneDto>> updateProgress(
            @PathVariable Long milestoneId,
            @Valid @RequestBody UpdateMilestoneProgressRequest request) {
        MilestoneDto updated = milestoneService.updateMilestoneProgress(milestoneId, request);
        return ResponseEntity.ok(ApiResponse.success("Milestone progress updated successfully", updated));
    }

    @PutMapping("/{milestoneId}")
    public ResponseEntity<ApiResponse<MilestoneDto>> updateMilestone(
            @PathVariable Long milestoneId,
            @RequestBody CreateMilestoneRequest request) {
        MilestoneDto updated = milestoneService.updateMilestone(milestoneId, request);
        return ResponseEntity.ok(ApiResponse.success("Milestone updated successfully", updated));
    }

    @DeleteMapping("/{milestoneId}")
    public ResponseEntity<ApiResponse<Void>> deleteMilestone(@PathVariable Long milestoneId) {
        milestoneService.deleteMilestone(milestoneId);
        return ResponseEntity.ok(ApiResponse.success("Milestone deleted successfully", null));
    }
}
