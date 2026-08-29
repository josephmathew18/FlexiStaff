package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.CreateMilestoneRequest;
import com.flexistaff.backend.dto.request.UpdateMilestoneProgressRequest;
import com.flexistaff.backend.dto.response.MilestoneDto;
import com.flexistaff.backend.entity.Milestone;
import com.flexistaff.backend.entity.Project;
import com.flexistaff.backend.entity.enums.MilestoneStatus;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.repository.MilestoneRepository;
import com.flexistaff.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public MilestoneDto createMilestone(CreateMilestoneRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        Milestone milestone = Milestone.builder()
                .project(project)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .progressPercentage(0)
                .status(MilestoneStatus.NOT_STARTED)
                .weightage(request.getWeightage() != null ? request.getWeightage() : 1.0)
                .build();

        Milestone saved = milestoneRepository.save(milestone);
        return mapToMilestoneDto(saved);
    }

    @Transactional(readOnly = true)
    public List<MilestoneDto> getMilestonesByProject(Long projectId) {
        return milestoneRepository.findByProjectId(projectId).stream()
                .map(this::mapToMilestoneDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MilestoneDto updateMilestoneProgress(Long milestoneId, UpdateMilestoneProgressRequest request) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", "id", milestoneId));

        if (request.getProgressPercentage() != null) {
            milestone.setProgressPercentage(request.getProgressPercentage());
            if (request.getProgressPercentage() == 100) {
                milestone.setStatus(MilestoneStatus.COMPLETED);
            } else if (request.getProgressPercentage() > 0 && milestone.getStatus() == MilestoneStatus.NOT_STARTED) {
                milestone.setStatus(MilestoneStatus.IN_PROGRESS);
            }
        }

        if (request.getStatus() != null) {
            milestone.setStatus(request.getStatus());
        }

        Milestone updated = milestoneRepository.save(milestone);
        return mapToMilestoneDto(updated);
    }

    public MilestoneDto mapToMilestoneDto(Milestone milestone) {
        return MilestoneDto.builder()
                .id(milestone.getId())
                .projectId(milestone.getProject().getId())
                .title(milestone.getTitle())
                .description(milestone.getDescription())
                .dueDate(milestone.getDueDate())
                .progressPercentage(milestone.getProgressPercentage())
                .status(milestone.getStatus())
                .weightage(milestone.getWeightage())
                .createdAt(milestone.getCreatedAt())
                .build();
    }
}
