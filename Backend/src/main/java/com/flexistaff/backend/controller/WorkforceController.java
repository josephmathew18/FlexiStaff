package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.request.AssignWorkforceRequest;
import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.dto.response.WorkforceAllocationDto;
import com.flexistaff.backend.entity.enums.AllocationStatus;
import com.flexistaff.backend.service.WorkforceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workforce")
@RequiredArgsConstructor
public class WorkforceController {

    private final WorkforceService workforceService;

    @PostMapping("/assign")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<WorkforceAllocationDto>> assignWorkforce(
            @Valid @RequestBody AssignWorkforceRequest request) {
        WorkforceAllocationDto allocation = workforceService.assignWorkforce(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Workforce allocated successfully", allocation));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<WorkforceAllocationDto>>> getAllocationsByProject(
            @PathVariable Long projectId) {
        List<WorkforceAllocationDto> allocations = workforceService.getAllocationsByProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("Project workforce allocations retrieved", allocations));
    }

    @GetMapping("/professional/{professionalId}")
    public ResponseEntity<ApiResponse<List<WorkforceAllocationDto>>> getAllocationsByProfessional(
            @PathVariable Long professionalId) {
        List<WorkforceAllocationDto> allocations = workforceService.getAllocationsByProfessional(professionalId);
        return ResponseEntity.ok(ApiResponse.success("Professional allocations retrieved", allocations));
    }

    @PatchMapping("/{allocationId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<WorkforceAllocationDto>> updateStatus(
            @PathVariable Long allocationId,
            @RequestParam AllocationStatus status) {
        WorkforceAllocationDto updated = workforceService.updateAllocationStatus(allocationId, status);
        return ResponseEntity.ok(ApiResponse.success("Workforce allocation status updated", updated));
    }
}
