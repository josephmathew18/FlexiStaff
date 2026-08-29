package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.response.DashboardSummaryDto;
import com.flexistaff.backend.dto.response.ProjectDto;
import com.flexistaff.backend.dto.response.WorkforceAllocationDto;
import com.flexistaff.backend.entity.enums.ProjectStatus;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.repository.ProjectRepository;
import com.flexistaff.backend.repository.UserRepository;
import com.flexistaff.backend.repository.WorkforceAllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final WorkforceAllocationRepository allocationRepository;
    private final ProjectService projectService;
    private final WorkforceService workforceService;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getAdminDashboardSummary() {
        long totalProjects = projectRepository.count();
        long activeProjects = projectRepository.countByStatus(ProjectStatus.IN_PROGRESS);
        long completedProjects = projectRepository.countByStatus(ProjectStatus.COMPLETED);
        long totalUsers = userRepository.count();
        long totalProfessionals = userRepository.findByRole(Role.ROLE_PROFESSIONAL).size();
        long totalClients = userRepository.findByRole(Role.ROLE_CLIENT).size();

        List<ProjectDto> recentProjects = projectService.getAllProjects().stream()
                .limit(5)
                .toList();

        return DashboardSummaryDto.builder()
                .userRole(Role.ROLE_ADMIN.name())
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .totalUsers(totalUsers)
                .totalProfessionals(totalProfessionals)
                .totalClients(totalClients)
                .recentProjects(recentProjects)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getManagerDashboardSummary(Long managerId) {
        List<ProjectDto> managerProjects = projectService.getProjectsByManager(managerId);

        long activeCount = managerProjects.stream().filter(p -> p.getStatus() == ProjectStatus.IN_PROGRESS).count();
        long completedCount = managerProjects.stream().filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count();

        return DashboardSummaryDto.builder()
                .userRole(Role.ROLE_MANAGER.name())
                .totalProjects(managerProjects.size())
                .activeProjects(activeCount)
                .completedProjects(completedCount)
                .recentProjects(managerProjects)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getClientDashboardSummary(Long clientId) {
        List<ProjectDto> clientProjects = projectService.getProjectsByClient(clientId);

        long activeCount = clientProjects.stream().filter(p -> p.getStatus() == ProjectStatus.IN_PROGRESS).count();
        long completedCount = clientProjects.stream().filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count();

        BigDecimal totalSpend = clientProjects.stream()
                .map(p -> p.getBudget() != null ? p.getBudget() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardSummaryDto.builder()
                .userRole(Role.ROLE_CLIENT.name())
                .totalProjects(clientProjects.size())
                .activeProjects(activeCount)
                .completedProjects(completedCount)
                .totalBudgetOrSpend(totalSpend)
                .recentProjects(clientProjects)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getProfessionalDashboardSummary(Long professionalId) {
        List<WorkforceAllocationDto> allocations = workforceService.getAllocationsByProfessional(professionalId);

        return DashboardSummaryDto.builder()
                .userRole(Role.ROLE_PROFESSIONAL.name())
                .totalProjects(allocations.size())
                .recentAllocations(allocations)
                .build();
    }
}
