package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.request.CreateProjectRequest;
import com.flexistaff.backend.dto.request.UpdateProjectRequest;
import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.dto.response.ProjectDto;
import com.flexistaff.backend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(@Valid @RequestBody CreateProjectRequest request) {
        ProjectDto created = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getAllProjects() {
        List<ProjectDto> projects = projectService.getAllProjects();
        return ResponseEntity.ok(ApiResponse.success("Projects list retrieved successfully", projects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDto>> getProjectById(@PathVariable Long id) {
        ProjectDto project = projectService.getProjectById(id);
        return ResponseEntity.ok(ApiResponse.success("Project details retrieved successfully", project));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getProjectsByClient(@PathVariable Long clientId) {
        List<ProjectDto> projects = projectService.getProjectsByClient(clientId);
        return ResponseEntity.ok(ApiResponse.success("Client projects retrieved successfully", projects));
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getProjectsByManager(@PathVariable Long managerId) {
        List<ProjectDto> projects = projectService.getProjectsByManager(managerId);
        return ResponseEntity.ok(ApiResponse.success("Manager projects retrieved successfully", projects));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request) {
        ProjectDto updated = projectService.updateProject(id, request);
        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", updated));
    }
}
