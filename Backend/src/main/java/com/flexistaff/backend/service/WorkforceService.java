package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.AssignWorkforceRequest;
import com.flexistaff.backend.dto.response.WorkforceAllocationDto;
import com.flexistaff.backend.entity.Client;
import com.flexistaff.backend.entity.Project;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.WorkforceAllocation;
import com.flexistaff.backend.entity.enums.AllocationStatus;
import com.flexistaff.backend.entity.enums.ProjectStatus;
import com.flexistaff.backend.exception.BadRequestException;
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
    private final com.flexistaff.backend.repository.FreelancerRepository freelancerRepository;
    private final com.flexistaff.backend.repository.ClientRepository clientRepository;
    private final com.flexistaff.backend.repository.PartnerCompanyRepository partnerCompanyRepository;

    @Transactional
    public WorkforceAllocationDto assignWorkforce(AssignWorkforceRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        if (project.getStatus() == ProjectStatus.REJECTED ||
            project.getStatus() == ProjectStatus.DECLINED ||
            project.getStatus() == ProjectStatus.CANCELLED) {
            throw new BadRequestException("Cannot assign workforce to a rejected or cancelled project.");
        }

        // Resolve professional User (request.getProfessionalId() could be User ID or Freelancer ID)
        User professional = userRepository.findById(request.getProfessionalId()).orElse(null);
        if (professional == null) {
            com.flexistaff.backend.entity.Freelancer fl = freelancerRepository.findById(request.getProfessionalId()).orElse(null);
            if (fl != null && fl.getUser() != null) {
                professional = fl.getUser();
            }
        }
        if (professional == null) {
            throw new ResourceNotFoundException("Professional User", "id", request.getProfessionalId());
        }

        final Long resolvedProfId = professional.getId();

        // 1. Prevent duplicate assignments for the same project + professional
        java.util.Optional<WorkforceAllocation> existingOpt = allocationRepository.findByProjectIdAndProfessionalId(project.getId(), resolvedProfId);
        if (existingOpt.isPresent()) {
            WorkforceAllocation existing = existingOpt.get();
            if (request.getRoleInProject() != null && !request.getRoleInProject().isBlank()) {
                existing.setRoleInProject(request.getRoleInProject());
            }
            if (request.getAllocatedHoursPerWeek() != null) {
                existing.setAllocatedHoursPerWeek(request.getAllocatedHoursPerWeek());
            }
            if (request.getBillableRate() != null) {
                existing.setBillableRate(request.getBillableRate());
            }
            if (request.getStatus() != null) {
                existing.setStatus(request.getStatus());
            } else if (existing.getStatus() == AllocationStatus.CANCELLED ||
                       existing.getStatus() == AllocationStatus.REJECTED ||
                       existing.getStatus() == AllocationStatus.DECLINED ||
                       existing.getStatus() == AllocationStatus.DECLINED_BY_CANDIDATE) {
                existing.setStatus(AllocationStatus.ASSIGNED);
            }

            if (request.getManagerId() != null) {
                userRepository.findById(request.getManagerId()).ifPresent(existing::setManager);
            }

            WorkforceAllocation updated = allocationRepository.save(existing);
            return mapToAllocationDto(updated);
        }

        // 2. Enforce strict workforce capacity limit based on project's required headcount
        List<WorkforceAllocation> existingProjectAllocations = allocationRepository.findByProjectId(project.getId());
        long activeCount = existingProjectAllocations.stream()
                .filter(a -> a.getStatus() != AllocationStatus.CANCELLED &&
                             a.getStatus() != AllocationStatus.REJECTED &&
                             a.getStatus() != AllocationStatus.DECLINED &&
                             a.getStatus() != AllocationStatus.DECLINED_BY_CANDIDATE)
                .count();

        int maxCapacity = project.getWorkforceRequired() != null && project.getWorkforceRequired() > 0
                ? project.getWorkforceRequired()
                : 5;

        if (activeCount >= maxCapacity) {
            throw new BadRequestException("Maximum " + maxCapacity + " workforce members can be assigned to project '" + project.getTitle() + "' (" + activeCount + " already active).");
        }

        // 3. Resolve manager
        User manager = null;
        if (request.getManagerId() != null) {
            manager = userRepository.findById(request.getManagerId()).orElse(null);
            if (manager != null && project.getManager() == null) {
                project.setManager(manager);
            }
        }
        if (manager == null && project.getManager() != null) {
            manager = project.getManager();
        }

        AllocationStatus initialStatus = request.getStatus() != null ? request.getStatus() : AllocationStatus.ASSIGNED;

        WorkforceAllocation allocation = WorkforceAllocation.builder()
                .project(project)
                .professional(professional)
                .manager(manager)
                .roleInProject(request.getRoleInProject() != null ? request.getRoleInProject() : "Team Member")
                .allocatedHoursPerWeek(request.getAllocatedHoursPerWeek() != null ? request.getAllocatedHoursPerWeek() : 40)
                .billableRate(request.getBillableRate())
                .status(initialStatus)
                .build();

        WorkforceAllocation saved = allocationRepository.save(allocation);

        // 4. Synchronize project status: if approved and workforce assigned/accepted, advance to IN_PROGRESS
        if (project.getStatus() == ProjectStatus.APPROVED &&
            (initialStatus == AllocationStatus.ASSIGNED || initialStatus == AllocationStatus.ACTIVE || initialStatus == AllocationStatus.ACCEPTED)) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
            projectRepository.save(project);
        }

        return mapToAllocationDto(saved);
    }

    @Transactional(readOnly = true)
    public List<WorkforceAllocationDto> getAllAllocations() {
        return allocationRepository.findAll().stream()
                .filter(alloc -> alloc.getProject() != null &&
                        alloc.getProject().getStatus() != ProjectStatus.REJECTED &&
                        alloc.getProject().getStatus() != ProjectStatus.DECLINED &&
                        alloc.getProject().getStatus() != ProjectStatus.CANCELLED)
                .map(this::mapToAllocationDto)
                .collect(Collectors.toList());
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
                .filter(alloc -> alloc.getProject() != null &&
                        alloc.getProject().getStatus() != ProjectStatus.REJECTED &&
                        alloc.getProject().getStatus() != ProjectStatus.DECLINED &&
                        alloc.getProject().getStatus() != ProjectStatus.CANCELLED &&
                        alloc.getStatus() != AllocationStatus.CANCELLED &&
                        alloc.getStatus() != AllocationStatus.REJECTED &&
                        alloc.getStatus() != AllocationStatus.DECLINED &&
                        alloc.getStatus() != AllocationStatus.DECLINED_BY_CANDIDATE)
                .map(this::mapToAllocationDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkforceAllocationDto updateAllocationStatus(Long allocationId, AllocationStatus status) {
        WorkforceAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkforceAllocation", "id", allocationId));

        allocation.setStatus(status);
        WorkforceAllocation updated = allocationRepository.save(allocation);

        Project project = updated.getProject();
        if (project != null && project.getStatus() == ProjectStatus.APPROVED &&
            (status == AllocationStatus.ACCEPTED || status == AllocationStatus.ACTIVE || status == AllocationStatus.ASSIGNED)) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
            projectRepository.save(project);
        }

        return mapToAllocationDto(updated);
    }

    public WorkforceAllocationDto mapToAllocationDto(WorkforceAllocation allocation) {
        if (allocation == null) return null;
        User profUser = allocation.getProfessional();
        Long profId = profUser != null ? profUser.getId() : null;
        String profName = profUser != null ? profUser.getFullName() : null;
        String profEmail = profUser != null ? profUser.getEmail() : "";
        String phone = profUser != null ? profUser.getPhone() : "";

        User mgrUser = allocation.getManager() != null ? allocation.getManager() :
                (allocation.getProject() != null ? allocation.getProject().getManager() : null);
        Long mgrId = mgrUser != null ? mgrUser.getId() : null;
        String mgrName = mgrUser != null ? mgrUser.getFullName() : null;

        User clientUser = allocation.getProject() != null ? allocation.getProject().getClient() : null;
        Long clientId = clientUser != null ? clientUser.getId() : null;
        String clientName = clientUser != null ? clientUser.getFullName() : null;
        String clientCompanyName = null;
        if (clientId != null) {
            com.flexistaff.backend.entity.Client cProfile = clientRepository.findByUserId(clientId).orElse(null);
            if (cProfile != null) {
                clientCompanyName = cProfile.getCompanyName();
            }
        }

        com.flexistaff.backend.entity.Freelancer freelancer = null;
        if (profId != null) {
            freelancer = freelancerRepository.findByUserId(profId).orElse(null);
        }
        if (freelancer == null && profEmail != null && !profEmail.isBlank()) {
            freelancer = freelancerRepository.findByEmailIgnoreCase(profEmail.trim()).orElse(null);
        }

        String workforceType = "Independent Freelancer";
        Long partnerCompanyId = null;
        String partnerCompanyName = null;
        String roleType = "Freelancer";
        String experience = "3+ years";
        String skills = "";
        String hourlyRateStr = allocation.getBillableRate() != null
                ? "$" + allocation.getBillableRate().stripTrailingZeros().toPlainString() + "/hr"
                : null;
        String workloadStr = allocation.getAllocatedHoursPerWeek() != null
                ? allocation.getAllocatedHoursPerWeek() + "h/wk"
                : null;

        if (freelancer != null) {
            if (freelancer.getName() != null && !freelancer.getName().isBlank()) {
                profName = freelancer.getName();
            }
            if (freelancer.getPhone() != null && !freelancer.getPhone().isBlank()) {
                phone = freelancer.getPhone();
            }
            if (freelancer.getExperienceYears() != null) {
                experience = freelancer.getExperienceYears() + "+ years";
            }
            if (freelancer.getSkills() != null) {
                skills = freelancer.getSkills();
            }
            if (allocation.getBillableRate() == null && freelancer.getHourlyRate() != null) {
                hourlyRateStr = "$" + freelancer.getHourlyRate().stripTrailingZeros().toPlainString() + "/hr";
            }

            final Long pcId = freelancer.getPartnerCompanyId();
            if (pcId != null) {
                // Must be a genuine partner company, NEVER a client
                com.flexistaff.backend.entity.PartnerCompany partnerCompany = partnerCompanyRepository.findById(pcId)
                        .orElseGet(() -> partnerCompanyRepository.findByUserId(pcId).orElse(null));

                boolean isClientRecord = false;
                if (partnerCompany != null) {
                    if (partnerCompany.getUser() != null && clientRepository.existsByUserId(partnerCompany.getUser().getId())) {
                        isClientRecord = true;
                    }
                    if (partnerCompany.getCompanyName() != null && clientRepository.existsByCompanyNameIgnoreCase(partnerCompany.getCompanyName())) {
                        isClientRecord = true;
                    }
                }
                if (clientRepository.existsById(pcId) || clientRepository.existsByUserId(pcId)) {
                    isClientRecord = true;
                }

                if (partnerCompany != null && !isClientRecord && partnerCompany.getCompanyName() != null && !partnerCompany.getCompanyName().isBlank()) {
                    partnerCompanyId = partnerCompany.getId();
                    partnerCompanyName = partnerCompany.getCompanyName();
                    workforceType = "Partner Company";
                    roleType = "Professional";
                }
            }
        }

        if (profName == null || profName.isBlank()) {
            profName = profUser != null ? profUser.getFullName() : "";
        }
        if (hourlyRateStr == null && allocation.getBillableRate() != null) {
            hourlyRateStr = "$" + allocation.getBillableRate().stripTrailingZeros().toPlainString() + "/hr";
        }
        if (workloadStr == null && allocation.getAllocatedHoursPerWeek() != null) {
            workloadStr = allocation.getAllocatedHoursPerWeek() + "h/wk";
        }

        return WorkforceAllocationDto.builder()
                .id(allocation.getId())
                .projectId(allocation.getProject() != null ? allocation.getProject().getId() : null)
                .projectTitle(allocation.getProject() != null ? allocation.getProject().getTitle() : null)
                .clientId(clientId)
                .clientName(clientName)
                .clientCompanyName(clientCompanyName)
                .managerId(mgrId)
                .managerName(mgrName)
                .professionalId(profId)
                .professionalName(profName)
                .professionalEmail(profEmail)
                .roleInProject(allocation.getRoleInProject())
                .allocatedHoursPerWeek(allocation.getAllocatedHoursPerWeek())
                .billableRate(allocation.getBillableRate())
                .status(allocation.getStatus())
                .createdAt(allocation.getCreatedAt())
                .workforceType(workforceType)
                .partnerCompanyId(partnerCompanyId)
                .partnerCompanyName(partnerCompanyName)
                .roleType(roleType)
                .hourlyRate(hourlyRateStr)
                .workload(workloadStr)
                .experience(experience)
                .skills(skills)
                .phone(phone)
                .build();
    }
}
