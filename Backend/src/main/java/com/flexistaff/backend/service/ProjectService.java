package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.CreateProjectRequest;
import com.flexistaff.backend.dto.request.UpdateProjectRequest;
import com.flexistaff.backend.dto.response.MilestoneDto;
import com.flexistaff.backend.dto.response.ProjectDto;
import com.flexistaff.backend.dto.response.WorkforceAllocationDto;
import com.flexistaff.backend.entity.Client;
import com.flexistaff.backend.entity.Milestone;
import com.flexistaff.backend.entity.Project;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.WorkforceAllocation;
import com.flexistaff.backend.entity.enums.AllocationStatus;
import com.flexistaff.backend.entity.enums.MilestoneStatus;
import com.flexistaff.backend.entity.enums.ProjectStatus;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.repository.ClientRepository;
import com.flexistaff.backend.repository.MilestoneRepository;
import com.flexistaff.backend.repository.ProjectRepository;
import com.flexistaff.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final MilestoneRepository milestoneRepository;
    private final com.flexistaff.backend.repository.FreelancerRepository freelancerRepository;
    private final com.flexistaff.backend.repository.PartnerCompanyRepository partnerCompanyRepository;
    private final com.flexistaff.backend.repository.HrManagerRepository hrManagerRepository;

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request) {
        User client = null;
        if (request.getClientId() != null) {
            client = userRepository.findById(request.getClientId()).orElse(null);
            if (client == null) {
                Client clientEntity = clientRepository.findById(request.getClientId()).orElse(null);
                if (clientEntity != null && clientEntity.getUser() != null) {
                    client = clientEntity.getUser();
                }
            }
        }
        if (client == null) {
            List<User> clientUsers = userRepository.findByRole(com.flexistaff.backend.entity.enums.Role.ROLE_CLIENT);
            if (!clientUsers.isEmpty()) {
                client = clientUsers.get(0);
            }
        }
        if (client == null) {
            throw new ResourceNotFoundException("Client User", "id", request.getClientId() != null ? request.getClientId() : 0L);
        }

        User manager = null;
        if (request.getManagerId() != null && request.getManagerId() > 0) {
            manager = userRepository.findById(request.getManagerId()).orElse(null);
            if (manager == null) {
                com.flexistaff.backend.entity.HrManager hrM = hrManagerRepository.findById(request.getManagerId()).orElse(null);
                if (hrM != null) {
                    manager = hrM.getUser();
                }
            }
        }

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills())
                .client(client)
                .manager(manager)
                .budget(request.getBudget())
                .status(ProjectStatus.PENDING_APPROVAL)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        Project savedProject = projectRepository.save(project);

        List<Milestone> defaultMilestones = List.of(
                Milestone.builder().project(savedProject).title("Requirement Analysis").description("Analyze project requirements and scope").weightage(10.0).progressPercentage(0).status(MilestoneStatus.NOT_STARTED).dueDate(savedProject.getStartDate()).build(),
                Milestone.builder().project(savedProject).title("UI/UX & System Design").description("Design system architecture and UI").weightage(20.0).progressPercentage(0).status(MilestoneStatus.NOT_STARTED).dueDate(savedProject.getStartDate()).build(),
                Milestone.builder().project(savedProject).title("Backend & Database Development").description("Develop backend services, database schema, and APIs").weightage(25.0).progressPercentage(0).status(MilestoneStatus.NOT_STARTED).dueDate(savedProject.getEndDate()).build(),
                Milestone.builder().project(savedProject).title("Frontend & Integration").description("Implement frontend UI and integrate with backend APIs").weightage(25.0).progressPercentage(0).status(MilestoneStatus.NOT_STARTED).dueDate(savedProject.getEndDate()).build(),
                Milestone.builder().project(savedProject).title("Testing, Deployment & Final Delivery").description("Conduct quality assurance, deployment, and final release").weightage(20.0).progressPercentage(0).status(MilestoneStatus.NOT_STARTED).dueDate(savedProject.getEndDate()).build()
        );
        milestoneRepository.saveAll(defaultMilestones);
        savedProject.setMilestones(new ArrayList<>(defaultMilestones));

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
        if (clientId == null) {
            return new ArrayList<>();
        }
        List<Project> projects = new ArrayList<>(projectRepository.findByClientId(clientId));
        
        Long alternateId = null;
        User user = userRepository.findById(clientId).orElse(null);
        if (user != null) {
            Client clientProfile = clientRepository.findByUserId(user.getId()).orElse(null);
            if (clientProfile != null) {
                alternateId = clientProfile.getId();
            }
        } else {
            Client clientEntity = clientRepository.findById(clientId).orElse(null);
            if (clientEntity != null && clientEntity.getUser() != null) {
                alternateId = clientEntity.getUser().getId();
            }
        }

        if (alternateId != null && !alternateId.equals(clientId)) {
            List<Project> altProjects = projectRepository.findByClientId(alternateId);
            for (Project p : altProjects) {
                if (projects.stream().noneMatch(existing -> existing.getId().equals(p.getId()))) {
                    projects.add(p);
                }
            }
        }

        return projects.stream()
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
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
            if (request.getStatus() == ProjectStatus.REJECTED || request.getStatus() == ProjectStatus.DECLINED || request.getStatus() == ProjectStatus.CANCELLED) {
                if (project.getAllocations() != null) {
                    project.getAllocations().forEach(alloc -> alloc.setStatus(AllocationStatus.CANCELLED));
                }
            }
        }
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());

        if (request.getManagerId() != null) {
            if (request.getManagerId() > 0) {
                User manager = userRepository.findById(request.getManagerId()).orElse(null);
                if (manager == null) {
                    com.flexistaff.backend.entity.HrManager hrM = hrManagerRepository.findById(request.getManagerId()).orElse(null);
                    if (hrM != null) {
                        manager = hrM.getUser();
                    }
                }
                if (manager != null) {
                    project.setManager(manager);
                } else {
                    throw new ResourceNotFoundException("Manager User", "id", request.getManagerId());
                }
            } else {
                project.setManager(null);
            }
        }

        Project updated = projectRepository.save(project);
        return mapToProjectDto(updated);
    }

    @Transactional
    public ProjectDto rejectProject(Long id, String reason) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        project.setStatus(ProjectStatus.REJECTED);

        if (project.getAllocations() != null) {
            project.getAllocations().forEach(alloc -> alloc.setStatus(AllocationStatus.CANCELLED));
        }

        Project updated = projectRepository.save(project);
        return mapToProjectDto(updated);
    }

    public ProjectDto mapToProjectDto(Project project) {
        User clientUser = project.getClient();
        Long primaryUserId = clientUser != null ? clientUser.getId() : null;

        String contactName = clientUser != null && clientUser.getFullName() != null
                ? clientUser.getFullName() : null;
        String clientEmail = clientUser != null && clientUser.getEmail() != null
                ? clientUser.getEmail() : null;

        String companyName = null;
        if (clientUser != null) {
            Client clientEntity = clientRepository.findByUserId(clientUser.getId()).orElse(null);
            if (clientEntity == null) {
                clientEntity = clientRepository.findById(clientUser.getId()).orElse(null);
            }

            if (clientEntity != null) {
                if (clientEntity.getCompanyName() != null && !clientEntity.getCompanyName().isBlank()) {
                    companyName = clientEntity.getCompanyName();
                }
                if (clientEntity.getName() != null && !clientEntity.getName().isBlank()) {
                    contactName = clientEntity.getName();
                }
                if (clientEntity.getEmail() != null && !clientEntity.getEmail().isBlank()) {
                    clientEmail = clientEntity.getEmail();
                }
            }

            if (companyName == null || companyName.isBlank()) {
                if (clientUser.getClientProfile() != null && clientUser.getClientProfile().getCompanyName() != null && !clientUser.getClientProfile().getCompanyName().isBlank()) {
                    companyName = clientUser.getClientProfile().getCompanyName();
                } else {
                    companyName = contactName;
                }
            }
        }

        ProjectDto dto = ProjectDto.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .requiredSkills(project.getRequiredSkills())
                .clientId(primaryUserId)
                .clientName(contactName)
                .clientCompanyName(companyName)
                .clientEmail(clientEmail)
                .budget(project.getBudget())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .createdAt(project.getCreatedAt())
                .build();

        if (project.getManager() != null) {
            User mgr = project.getManager();
            if (mgr.getRole() == com.flexistaff.backend.entity.enums.Role.ROLE_ADMIN ||
                "System Administrator".equalsIgnoreCase(mgr.getFullName()) ||
                "System Admin".equalsIgnoreCase(mgr.getFullName()) ||
                mgr.getRole() != com.flexistaff.backend.entity.enums.Role.ROLE_MANAGER) {
                dto.setManagerId(null);
                dto.setManagerName(null);
                dto.setManagerEmail(null);
                dto.setManagerPhone(null);
            } else {
                dto.setManagerId(mgr.getId());
                dto.setManagerName(mgr.getFullName());
                dto.setManagerEmail(mgr.getEmail());
                dto.setManagerPhone(mgr.getPhone());
            }
        } else {
            dto.setManagerId(null);
            dto.setManagerName(null);
            dto.setManagerEmail(null);
            dto.setManagerPhone(null);
        }

        if (project.getAllocations() != null) {
            dto.setAllocations(project.getAllocations().stream()
                    .map(this::mapAllocationWithDetails)
                    .collect(Collectors.toList()));
        }

        if (project.getMilestones() != null && !project.getMilestones().isEmpty()) {
            List<MilestoneDto> milestoneDtos = project.getMilestones().stream()
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
                    .collect(Collectors.toList());
            dto.setMilestones(milestoneDtos);

            long completedCount = milestoneDtos.stream()
                    .filter(m -> m.getStatus() == com.flexistaff.backend.entity.enums.MilestoneStatus.COMPLETED)
                    .count();
            int calcProgress = MilestoneService.calculateOverallProgress(completedCount);
            dto.setProgressPercentage(calcProgress);
        } else {
            dto.setProgressPercentage(0);
        }

        return dto;
    }

    public WorkforceAllocationDto mapAllocationWithDetails(WorkforceAllocation alloc) {
        if (alloc == null) return null;
        User profUser = alloc.getProfessional();
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
        String hourlyRateStr = alloc.getBillableRate() != null
                ? "$" + alloc.getBillableRate().stripTrailingZeros().toPlainString() + "/hr"
                : null;
        String workloadStr = alloc.getAllocatedHoursPerWeek() != null
                ? alloc.getAllocatedHoursPerWeek() + "h/wk"
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
            if (hourlyRateStr == null && freelancer.getHourlyRate() != null) {
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
        if (hourlyRateStr == null && alloc.getBillableRate() != null) {
            hourlyRateStr = "$" + alloc.getBillableRate().stripTrailingZeros().toPlainString() + "/hr";
        }
        if (workloadStr == null && alloc.getAllocatedHoursPerWeek() != null) {
            workloadStr = alloc.getAllocatedHoursPerWeek() + "h/wk";
        }

        return WorkforceAllocationDto.builder()
                .id(alloc.getId())
                .projectId(alloc.getProject() != null ? alloc.getProject().getId() : null)
                .projectTitle(alloc.getProject() != null ? alloc.getProject().getTitle() : null)
                .professionalId(profId)
                .professionalName(profName)
                .professionalEmail(profEmail)
                .roleInProject(alloc.getRoleInProject())
                .allocatedHoursPerWeek(alloc.getAllocatedHoursPerWeek())
                .billableRate(alloc.getBillableRate())
                .status(alloc.getStatus())
                .createdAt(alloc.getCreatedAt())
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
