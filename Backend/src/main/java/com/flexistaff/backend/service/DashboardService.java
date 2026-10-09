package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.response.DashboardSummaryDto;
import com.flexistaff.backend.dto.response.ProjectDto;
import com.flexistaff.backend.dto.response.WorkforceAllocationDto;
import com.flexistaff.backend.entity.enums.ProjectStatus;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.repository.FreelancerRepository;
import com.flexistaff.backend.repository.ProjectRepository;
import com.flexistaff.backend.repository.UserRepository;
import com.flexistaff.backend.repository.WorkforceAllocationRepository;
import com.flexistaff.backend.entity.Freelancer;
import com.flexistaff.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final FreelancerRepository freelancerRepository;
    private final WorkforceAllocationRepository allocationRepository;
    private final ProjectService projectService;
    private final WorkforceService workforceService;
    private final FreelancerService freelancerService;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getAdminDashboardSummary() {
        long totalProjects = projectRepository.count();
        long activeProjects = projectRepository.countByStatus(ProjectStatus.IN_PROGRESS);
        long completedProjects = projectRepository.countByStatus(ProjectStatus.COMPLETED);
        long totalUsers = userRepository.count();
        long totalProfessionals = calculatePartnerProfessionalCount();
        long totalClients = userRepository.findByRoleAndActive(Role.ROLE_CLIENT, true).size();
        long freelancerCount = calculateIndependentFreelancerCount();

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
                .freelancerCount(freelancerCount)
                .recentProjects(recentProjects)
                .build();
    }

    private long calculatePartnerProfessionalCount() {
        try {
            List<com.flexistaff.backend.dto.response.FreelancerDto> all = freelancerService.getAllFreelancers();
            return all.stream()
                    .filter(t -> (t.getPartnerCompanyId() != null || "PARTNER_EMPLOYEE".equalsIgnoreCase(t.getProfessionalType()) || "Partner Company".equalsIgnoreCase(t.getSource()))
                            && !"Inactive".equalsIgnoreCase(t.getStatus()) && !"Rejected".equalsIgnoreCase(t.getStatus()))
                    .count();
        } catch (Exception ex) {
            return freelancerRepository.findAll().stream()
                    .filter(f -> f.getPartnerCompanyId() != null && (f.getStatus() == null || !"Inactive".equalsIgnoreCase(f.getStatus())))
                    .count();
        }
    }

    private long calculateIndependentFreelancerCount() {
        try {
            List<com.flexistaff.backend.dto.response.FreelancerDto> all = freelancerService.getAllFreelancers();
            return all.stream()
                    .filter(t -> (t.getPartnerCompanyId() == null && !"PARTNER_EMPLOYEE".equalsIgnoreCase(t.getProfessionalType()) && !"Partner Company".equalsIgnoreCase(t.getSource()))
                            && !"Inactive".equalsIgnoreCase(t.getStatus()) && !"Rejected".equalsIgnoreCase(t.getStatus()))
                    .count();
        } catch (Exception ex) {
            return freelancerRepository.findAll().stream()
                    .filter(f -> f.getPartnerCompanyId() == null && (f.getStatus() == null || !"Inactive".equalsIgnoreCase(f.getStatus())))
                    .count();
        }
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
