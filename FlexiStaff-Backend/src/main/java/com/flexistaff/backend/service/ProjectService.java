package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.CreateProjectRequest;
import com.flexistaff.backend.dto.request.UpdateProjectRequest;
import com.flexistaff.backend.dto.response.MilestoneDto;
import com.flexistaff.backend.dto.response.ProjectDto;
import com.flexistaff.backend.dto.response.WorkforceAllocationDto;
import com.flexistaff.backend.entity.Project;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.enums.ProjectStatus;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.repository.ProjectRepository;
import com.flexistaff.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request) {
        User client = userRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client User", "id", request.getClientId()));

        User manager = null;
        if (request.getManagerId() != null) {
            manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager User", "id", request.getManagerId()));
        }

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .client(client)
                .manager(manager)
                .budget(request.getBudget())
                .status(ProjectStatus.PENDING_APPROVAL)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        Project savedProject = projectRepository.save(project);
        return mapToProjectDto(savedProject);
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
        return mapToProjectDto(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToProjectDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getProjectsByClient(Long clientId) {
        return projectRepository.findByClientId(clientId).stream()
                .map(this::mapToProjectDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getProjectsByManager(Long managerId) {
        return projectRepository.findByManagerId(managerId).stream()
                .map(this::mapToProjectDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDto updateProject(Long id, UpdateProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        if (request.getTitle() != null) project.setTitle(request.getTitle());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getBudget() != null) project.setBudget(request.getBudget());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager User", "id", request.getManagerId()));
            project.setManager(manager);
        }

        Project updated = projectRepository.save(project);
        return mapToProjectDto(updated);
    }

    public ProjectDto mapToProjectDto(Project project) {
        ProjectDto dto = ProjectDto.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .clientId(project.getClient().getId())
                .clientName(project.getClient().getFullName())
                .clientCompanyName(project.getClient().getClientProfile() != null ?
                        project.getClient().getClientProfile().getCompanyName() : null)
                .budget(project.getBudget())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .createdAt(project.getCreatedAt())
                .build();

        if (project.getManager() != null) {
            dto.setManagerId(project.getManager().getId());
            dto.setManagerName(project.getManager().getFullName());
        }

        if (project.getAllocations() != null) {
            dto.setAllocations(project.getAllocations().stream()
                    .map(alloc -> WorkforceAllocationDto.builder()
                            .id(alloc.getId())
                            .projectId(project.getId())
                            .projectTitle(project.getTitle())
                            .professionalId(alloc.getProfessional().getId())
                            .professionalName(alloc.getProfessional().getFullName())
                            .professionalEmail(alloc.getProfessional().getEmail())
                            .roleInProject(alloc.getRoleInProject())
                            .allocatedHoursPerWeek(alloc.getAllocatedHoursPerWeek())
                            .billableRate(alloc.getBillableRate())
                            .status(alloc.getStatus())
                            .createdAt(alloc.getCreatedAt())
                            .build())
                    .collect(Collectors.toList()));
        }

        if (project.getMilestones() != null) {
            dto.setMilestones(project.getMilestones().stream()
                    .map(m -> MilestoneDto.builder()
                            .id(m.getId())
                            .projectId(project.getId())
                            .title(m.getTitle())
                            .description(m.getDescription())
                            .dueDate(m.getDueDate())
                            .progressPercentage(m.getProgressPercentage())
                            .status(m.getStatus())
                            .weightage(m.getWeightage())
                            .createdAt(m.getCreatedAt())
                            .build())
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}
