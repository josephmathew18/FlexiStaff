package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.request.CreateManagerRequest;
import com.flexistaff.backend.dto.request.UpdateManagerRequest;
import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.dto.response.ManagerDto;
import com.flexistaff.backend.service.ManagerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/managers")
@RequiredArgsConstructor
public class ManagerController {

    private final ManagerService managerService;

    @PostMapping
    public ResponseEntity<ApiResponse<ManagerDto>> createManager(@Valid @RequestBody CreateManagerRequest request) {
        ManagerDto created = managerService.createManager(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("HR Manager registered successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ManagerDto>>> getAllManagers() {
        List<ManagerDto> managers = managerService.getAllManagers();
        return ResponseEntity.ok(ApiResponse.success("Managers retrieved successfully", managers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ManagerDto>> getManagerById(@PathVariable Long id) {
        ManagerDto manager = managerService.getManagerById(id);
        return ResponseEntity.ok(ApiResponse.success("Manager details retrieved successfully", manager));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ManagerDto>> updateManager(
            @PathVariable Long id,
            @Valid @RequestBody UpdateManagerRequest request) {
        ManagerDto updated = managerService.updateManager(id, request);
        return ResponseEntity.ok(ApiResponse.success("Manager updated successfully", updated));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ManagerDto>> updateManagerStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusBody) {
        String status = statusBody != null ? statusBody.get("status") : "Active";
        String reason = statusBody != null ? statusBody.get("reason") : "";
        ManagerDto updated = managerService.updateManagerStatus(id, status, reason);
        return ResponseEntity.ok(ApiResponse.success("Manager status updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteManager(@PathVariable Long id) {
        managerService.deleteManager(id);
        return ResponseEntity.ok(ApiResponse.success("Manager removed successfully", null));
    }
}
