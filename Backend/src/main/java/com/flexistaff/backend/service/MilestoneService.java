package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.CreateMilestoneRequest;
import com.flexistaff.backend.dto.request.UpdateMilestoneProgressRequest;
import com.flexistaff.backend.dto.response.MilestoneDto;
import com.flexistaff.backend.entity.Milestone;
import com.flexistaff.backend.entity.Project;
import com.flexistaff.backend.entity.enums.MilestoneStatus;
import com.flexistaff.backend.entity.enums.ProjectStatus;
import com.flexistaff.backend.exception.BadRequestException;
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

        if (project.getStatus() == ProjectStatus.REJECTED ||
            project.getStatus() == ProjectStatus.DECLINED ||
            project.getStatus() == ProjectStatus.CANCELLED) {
            throw new BadRequestException("Cannot create milestones for a rejected or cancelled project.");
        }

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

        if (milestone.getProject() != null &&
            (milestone.getProject().getStatus() == ProjectStatus.REJECTED ||
             milestone.getProject().getStatus() == ProjectStatus.DECLINED ||
             milestone.getProject().getStatus() == ProjectStatus.CANCELLED)) {
            throw new BadRequestException("Cannot update milestone progress for a rejected or cancelled project.");
        }

        // Backend Skill-Based Workforce Authorization Check
        String domain = (request.getMilestoneSkillDomain() != null ? request.getMilestoneSkillDomain() : milestone.getTitle()).toLowerCase();
        String candidateSkills = request.getAuthorSkills() != null ? request.getAuthorSkills().toLowerCase() : "";
        String candidateRole = request.getAuthorRole() != null ? request.getAuthorRole().toLowerCase() : "";

        boolean isFrontendDomain = domain.contains("frontend") || domain.contains("ui") || domain.contains("design");
        boolean isBackendDomain = domain.contains("backend") || domain.contains("database");

        boolean hasFrontendSkill = candidateRole.contains("frontend") || candidateRole.contains("ui") || candidateSkills.contains("react") || candidateSkills.contains("html") || candidateSkills.contains("css");
        boolean hasBackendSkill = candidateRole.contains("backend") || candidateSkills.contains("java") || candidateSkills.contains("spring") || candidateSkills.contains("postgre") || candidateSkills.contains("python");
        boolean isFullstackOrLead = candidateRole.contains("full") || candidateRole.contains("architect") || candidateRole.contains("lead") || candidateRole.contains("workforce") || (hasFrontendSkill && hasBackendSkill);

        if (isFrontendDomain && !hasFrontendSkill && !isFullstackOrLead && (request.getAuthorRole() != null || request.getAuthorSkills() != null)) {
            throw new BadRequestException("Skill Mismatch: Your assigned role/skills do not authorize updates for Frontend/UI milestones.");
        }
        if (isBackendDomain && !hasBackendSkill && !isFullstackOrLead && (request.getAuthorRole() != null || request.getAuthorSkills() != null)) {
            throw new BadRequestException("Skill Mismatch: Your assigned role/skills do not authorize updates for Backend/Database milestones.");
        }

        if (request.getStatus() != null) {
            milestone.setStatus(request.getStatus());
            if (request.getStatus() == MilestoneStatus.COMPLETED) {
                milestone.setProgressPercentage(100);
            } else if (request.getStatus() == MilestoneStatus.IN_PROGRESS && milestone.getProgressPercentage() == 0) {
                milestone.setProgressPercentage(50);
            } else if (request.getStatus() == MilestoneStatus.NOT_STARTED) {
                milestone.setProgressPercentage(0);
            }
        } else if (request.getProgressPercentage() != null) {
            milestone.setProgressPercentage(request.getProgressPercentage());
            if (request.getProgressPercentage() == 100) {
                milestone.setStatus(MilestoneStatus.COMPLETED);
            } else if (request.getProgressPercentage() > 0 && milestone.getStatus() == MilestoneStatus.NOT_STARTED) {
                milestone.setStatus(MilestoneStatus.IN_PROGRESS);
            }
        }

        Milestone updated = milestoneRepository.save(milestone);

        // Recalculate overall project progress from completed milestone count
        Project project = updated.getProject();
        if (project != null) {
            List<Milestone> projectMilestones = milestoneRepository.findByProjectId(project.getId());
            long completedCount = projectMilestones.stream()
                    .filter(m -> m.getStatus() == MilestoneStatus.COMPLETED)
                    .count();
            int calculatedProgress = calculateOverallProgress(completedCount);
            if (calculatedProgress >= 100 && !projectMilestones.isEmpty() && project.getStatus() != ProjectStatus.REJECTED && project.getStatus() != ProjectStatus.DECLINED && project.getStatus() != ProjectStatus.CANCELLED) {
                project.setStatus(ProjectStatus.COMPLETED);
                projectRepository.save(project);
            } else if (calculatedProgress > 0 && project.getStatus() != ProjectStatus.COMPLETED && project.getStatus() != ProjectStatus.REJECTED && project.getStatus() != ProjectStatus.DECLINED && project.getStatus() != ProjectStatus.CANCELLED) {
                project.setStatus(ProjectStatus.IN_PROGRESS);
                projectRepository.save(project);
            }
        }

        return mapToMilestoneDto(updated);
    }

    public static int calculateOverallProgress(long completedCount) {
        if (completedCount == 1) return 10;
        if (completedCount == 2) return 30;
        if (completedCount == 3) return 55;
        if (completedCount == 4) return 80;
        if (completedCount >= 5) return 100;
        return 0;
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
