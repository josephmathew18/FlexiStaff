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
        return mapToAllocationDto(updated);
    }

    public WorkforceAllocationDto mapToAllocationDto(WorkforceAllocation allocation) {
        if (allocation == null) return null;
        User profUser = allocation.getProfessional();
        Long profId = profUser != null ? profUser.getId() : null;
        String profName = profUser != null ? profUser.getFullName() : null;
        String profEmail = profUser != null ? profUser.getEmail() : "";
        String phone = profUser != null ? profUser.getPhone() : "";

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
