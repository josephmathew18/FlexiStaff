package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.AssignWorkforceRequest;
import com.flexistaff.backend.dto.response.WorkforceAllocationDto;
import com.flexistaff.backend.entity.Project;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.WorkforceAllocation;
import com.flexistaff.backend.entity.enums.AllocationStatus;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.repository.ProjectRepository;
import com.flexistaff.backend.repository.UserRepository;
import com.flexistaff.backend.repository.WorkforceAllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkforceService {

    private final WorkforceAllocationRepository allocationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public WorkforceAllocationDto assignWorkforce(AssignWorkforceRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        User professional = userRepository.findById(request.getProfessionalId())
                .orElseThrow(() -> new ResourceNotFoundException("Professional User", "id", request.getProfessionalId()));

        WorkforceAllocation allocation = WorkforceAllocation.builder()
                .project(project)
                .professional(professional)
                .roleInProject(request.getRoleInProject() != null ? request.getRoleInProject() : "Team Member")
                .allocatedHoursPerWeek(request.getAllocatedHoursPerWeek() != null ? request.getAllocatedHoursPerWeek() : 40)
                .billableRate(request.getBillableRate())
                .status(AllocationStatus.ASSIGNED)
                .build();

        WorkforceAllocation saved = allocationRepository.save(allocation);
        return mapToAllocationDto(saved);
    }

    @Transactional(readOnly = true)
    public List<WorkforceAllocationDto> getAllocationsByProject(Long projectId) {
        return allocationRepository.findByProjectId(projectId).stream()
                .map(this::mapToAllocationDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkforceAllocationDto> getAllocationsByProfessional(Long professionalId) {
        return allocationRepository.findByProfessionalId(professionalId).stream()
                .map(this::mapToAllocationDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkforceAllocationDto updateAllocationStatus(Long allocationId, AllocationStatus status) {
        WorkforceAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkforceAllocation", "id", allocationId));

        allocation.setStatus(status);
        WorkforceAllocation updated = allocationRepository.save(allocation);
        return mapToAllocationDto(updated);
    }

    public WorkforceAllocationDto mapToAllocationDto(WorkforceAllocation allocation) {
        return WorkforceAllocationDto.builder()
                .id(allocation.getId())
                .projectId(allocation.getProject().getId())
                .projectTitle(allocation.getProject().getTitle())
                .professionalId(allocation.getProfessional().getId())
                .professionalName(allocation.getProfessional().getFullName())
                .professionalEmail(allocation.getProfessional().getEmail())
                .roleInProject(allocation.getRoleInProject())
                .allocatedHoursPerWeek(allocation.getAllocatedHoursPerWeek())
                .billableRate(allocation.getBillableRate())
                .status(allocation.getStatus())
                .createdAt(allocation.getCreatedAt())
                .build();
    }
}
