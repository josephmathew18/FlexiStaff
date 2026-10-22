package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.CreateCompanyFeedbackRequest;
import com.flexistaff.backend.dto.request.CreateProfessionalFeedbackRequest;
import com.flexistaff.backend.dto.response.*;
import com.flexistaff.backend.entity.*;
import com.flexistaff.backend.entity.enums.AllocationStatus;
import com.flexistaff.backend.entity.enums.ProjectStatus;
import com.flexistaff.backend.exception.BadRequestException;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final WorkforceAllocationRepository workforceAllocationRepository;
    private final FreelancerRepository freelancerRepository;
    private final ClientRepository clientRepository;
    private final PartnerCompanyRepository partnerCompanyRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;

    // =========================================================================
    // CLIENT ACTIONS
    // =========================================================================

    @Transactional
    public CompanyFeedbackDto submitCompanyFeedback(CreateCompanyFeedbackRequest request, Long currentUserId) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        // Enforce ownership: must be client's project
        if (project.getClient() == null || !project.getClient().getId().equals(currentUserId)) {
            throw new BadRequestException("You are only permitted to submit feedback for your own projects.");
        }

        // Enforce completed project requirement
        if (project.getStatus() != ProjectStatus.COMPLETED) {
            throw new BadRequestException("Feedback can only be submitted for completed projects. Current project status is: " + project.getStatus());
        }

        // Validate rating range 1-5
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be an integer between 1 and 5 stars.");
        }

        // Prevent duplicate review in unified feedback table
        if (feedbackRepository.existsByProjectIdAndClientIdAndFeedbackType(project.getId(), currentUserId, FeedbackType.COMPANY)) {
            throw new BadRequestException("Feedback for FlexiStaff AI has already been submitted for project '" + project.getTitle() + "'.");
        }

        User client = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        Feedback feedback = Feedback.builder()
                .feedbackType(FeedbackType.COMPANY)
                .project(project)
                .client(client)
                .professional(null)
                .rating(request.getRating())
                .comment(request.getComment() != null ? request.getComment().trim() : "")
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        log.info("Client ID {} submitted Company Feedback for project ID {} in unified feedback table", currentUserId, project.getId());
        return mapToCompanyFeedbackDto(saved);
    }

    @Transactional
    public ProfessionalFeedbackDto submitProfessionalFeedback(CreateProfessionalFeedbackRequest request, Long currentUserId) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        // Enforce ownership: must be client's project
        if (project.getClient() == null || !project.getClient().getId().equals(currentUserId)) {
            throw new BadRequestException("You are only permitted to submit feedback for your own projects.");
        }

        // Enforce completed project requirement
        if (project.getStatus() != ProjectStatus.COMPLETED) {
            throw new BadRequestException("Feedback can only be submitted for completed projects. Current project status is: " + project.getStatus());
        }

        // Validate rating range 1-5
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be an integer between 1 and 5 stars.");
        }

        // Resolve professional User
        User professional = resolveProfessionalUser(request.getProfessionalId());
        if (professional == null) {
            throw new ResourceNotFoundException("Professional User", "id", request.getProfessionalId());
        }

        final Long profUserId = professional.getId();

        // Enforce that the professional was assigned and accepted on this project
        List<WorkforceAllocation> allocations = workforceAllocationRepository.findByProjectId(project.getId());
        boolean isAssigned = allocations.stream().anyMatch(a ->
                a.getProfessional() != null &&
                a.getProfessional().getId().equals(profUserId) &&
                isAcceptedAllocation(a)
        );

        if (!isAssigned) {
            throw new BadRequestException("Specialist '" + professional.getFullName() + "' is not an accepted team member on project '" + project.getTitle() + "'.");
        }

        // Prevent duplicate review per professional on this project
        if (feedbackRepository.existsByProjectIdAndProfessionalIdAndFeedbackType(project.getId(), profUserId, FeedbackType.PROFESSIONAL)) {
            throw new BadRequestException("Feedback for specialist '" + professional.getFullName() + "' has already been submitted for this project.");
        }

        User client = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        Feedback feedback = Feedback.builder()
                .feedbackType(FeedbackType.PROFESSIONAL)
                .project(project)
                .client(client)
                .professional(professional)
                .rating(request.getRating())
                .comment(request.getComment() != null ? request.getComment().trim() : "")
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        log.info("Client ID {} submitted Professional Feedback for specialist ID {} on project ID {} in unified feedback table", currentUserId, profUserId, project.getId());

        // Update specialist's aggregate profile rating
        updateProfessionalAggregateRating(profUserId);

        return mapToProfessionalFeedbackDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjectFeedbackEligibilityDto> getClientProjectsFeedbackEligibility(Long currentUserId) {
        List<Project> clientProjects = projectRepository.findByClientId(currentUserId);

        return clientProjects.stream()
                .filter(p -> p.getStatus() == ProjectStatus.COMPLETED)
                .map(project -> {
                    // Check company feedback
                    Optional<Feedback> compFb = feedbackRepository.findByProjectIdAndClientIdAndFeedbackType(
                            project.getId(), currentUserId, FeedbackType.COMPANY
                    );
                    boolean companySubmitted = compFb.isPresent();
                    CompanyFeedbackDto companyDto = compFb.map(this::mapToCompanyFeedbackDto).orElse(null);

                    // Check assigned specialists (only include accepted/active team members)
                    List<WorkforceAllocation> allocations = workforceAllocationRepository.findByProjectId(project.getId()).stream()
                            .filter(this::isAcceptedAllocation)
                            .collect(Collectors.toList());
                    List<ProjectFeedbackEligibilityDto.AssignedProfessionalFeedbackStatus> profStatuses = allocations.stream()
                            .filter(a -> a.getProfessional() != null)
                            .map(a -> {
                                User prof = a.getProfessional();
                                Optional<Feedback> profFb = feedbackRepository.findByProjectIdAndProfessionalIdAndFeedbackType(
                                        project.getId(), prof.getId(), FeedbackType.PROFESSIONAL
                                );
                                ProfessionalFeedbackDto fbDto = profFb.map(this::mapToProfessionalFeedbackDto).orElse(null);

                                ProfessionalMetadata meta = resolveProfessionalMetadata(prof);

                                return ProjectFeedbackEligibilityDto.AssignedProfessionalFeedbackStatus.builder()
                                        .professionalId(prof.getId())
                                        .professionalName(meta.name != null ? meta.name : prof.getFullName())
                                        .professionalEmail(prof.getEmail())
                                        .roleInProject(a.getRoleInProject() != null ? a.getRoleInProject() : "Team Member")
                                        .workforceType(meta.workforceType)
                                        .partnerCompanyId(meta.partnerCompanyId)
                                        .partnerCompanyName(meta.partnerCompanyName)
                                        .feedbackSubmitted(profFb.isPresent())
                                        .feedback(fbDto)
                                        .build();
                            })
                            .collect(Collectors.toList());

                    return ProjectFeedbackEligibilityDto.builder()
                            .projectId(project.getId())
                            .projectTitle(project.getTitle())
                            .projectStatus(project.getStatus().name())
                            .isCompleted(true)
                            .companyFeedbackSubmitted(companySubmitted)
                            .companyFeedback(companyDto)
                            .assignedProfessionals(profStatuses)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getClientSubmittedFeedbacks(Long currentUserId) {
        List<CompanyFeedbackDto> companyList = feedbackRepository.findByClientIdAndFeedbackType(currentUserId, FeedbackType.COMPANY).stream()
                .map(this::mapToCompanyFeedbackDto)
                .collect(Collectors.toList());

        List<ProfessionalFeedbackDto> professionalList = feedbackRepository.findByClientIdAndFeedbackTypeOrderByCreatedAtDesc(currentUserId, FeedbackType.PROFESSIONAL).stream()
                .map(this::mapToProfessionalFeedbackDto)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("companyFeedbacks", companyList);
        result.put("professionalFeedbacks", professionalList);
        return result;
    }

    // =========================================================================
    // SYSTEM ADMIN ACTIONS
    // =========================================================================

    @Transactional(readOnly = true)
    public FeedbackSummaryDto getAdminFeedbackSummary() {
        List<Feedback> allCompany = feedbackRepository.findByFeedbackTypeOrderByCreatedAtDesc(FeedbackType.COMPANY);
        List<Feedback> allProf = feedbackRepository.findByFeedbackTypeOrderByCreatedAtDesc(FeedbackType.PROFESSIONAL);

        // 1. Company metrics
        Double companyAvg = feedbackRepository.calculateAverageRatingByFeedbackType(FeedbackType.COMPANY);
        long companyCount = allCompany.size();

        // 2. Identify partner employees vs freelancers
        Set<Long> partnerEmployeeUserIds = getPartnerEmployeeUserIds();

        List<Feedback> employeeFeedbacks = new ArrayList<>();
        List<Feedback> freelancerFeedbacks = new ArrayList<>();

        for (Feedback pf : allProf) {
            if (pf.getProfessional() != null && partnerEmployeeUserIds.contains(pf.getProfessional().getId())) {
                employeeFeedbacks.add(pf);
            } else {
                freelancerFeedbacks.add(pf);
            }
        }

        Double employeeAvg = employeeFeedbacks.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);

        Double freelancerAvg = freelancerFeedbacks.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);

        long totalReviews = companyCount + allProf.size();

        double totalRatingSum = allCompany.stream().mapToInt(Feedback::getRating).sum()
                + allProf.stream().mapToInt(Feedback::getRating).sum();

        Double overallAvg = totalReviews > 0 ? (totalRatingSum / totalReviews) : 0.0;

        return FeedbackSummaryDto.builder()
                .companyAverageRating(roundToOneDecimal(companyAvg != null ? companyAvg : 0.0))
                .companyReviewCount(companyCount)
                .employeeAverageRating(roundToOneDecimal(employeeAvg))
                .employeeReviewCount((long) employeeFeedbacks.size())
                .freelancerAverageRating(roundToOneDecimal(freelancerAvg))
                .freelancerReviewCount((long) freelancerFeedbacks.size())
                .overallAverageRating(roundToOneDecimal(overallAvg))
                .totalReviewCount(totalReviews)
                .companyFeedbacks(allCompany.stream().map(this::mapToCompanyFeedbackDto).collect(Collectors.toList()))
                .professionalFeedbacks(allProf.stream().map(this::mapToProfessionalFeedbackDto).collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public List<CompanyFeedbackDto> getAllCompanyFeedbacks() {
        return feedbackRepository.findByFeedbackTypeOrderByCreatedAtDesc(FeedbackType.COMPANY).stream()
                .map(this::mapToCompanyFeedbackDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProfessionalFeedbackDto> getAllProfessionalFeedbacks(String filter) {
        List<Feedback> all = feedbackRepository.findByFeedbackTypeOrderByCreatedAtDesc(FeedbackType.PROFESSIONAL);
        Set<Long> partnerEmployeeUserIds = getPartnerEmployeeUserIds();

        if ("employee".equalsIgnoreCase(filter)) {
            all = all.stream()
                    .filter(pf -> pf.getProfessional() != null && partnerEmployeeUserIds.contains(pf.getProfessional().getId()))
                    .collect(Collectors.toList());
        } else if ("freelancer".equalsIgnoreCase(filter)) {
            all = all.stream()
                    .filter(pf -> pf.getProfessional() != null && !partnerEmployeeUserIds.contains(pf.getProfessional().getId()))
                    .collect(Collectors.toList());
        }

        return all.stream().map(this::mapToProfessionalFeedbackDto).collect(Collectors.toList());
    }

    // =========================================================================
    // PARTNER COMPANY ACTIONS (STRICT ENFORCEMENT)
    // =========================================================================

    @Transactional(readOnly = true)
    public PartnerFeedbackSummaryDto getPartnerFeedbackSummary(Long partnerUserId) {
        PartnerCompany partner = partnerCompanyRepository.findByUserId(partnerUserId)
                .or(() -> {
                    User u = userRepository.findById(partnerUserId).orElse(null);
                    return u != null ? partnerCompanyRepository.findByEmailIgnoreCase(u.getEmail()) : Optional.empty();
                })
                .orElseThrow(() -> new BadRequestException("Partner company profile not found for user ID " + partnerUserId));

        // Get this partner's employees strictly
        List<Freelancer> employees = freelancerRepository.findByPartnerCompanyId(partner.getId());

        List<Long> employeeUserIds = employees.stream()
                .map(f -> f.getUser() != null ? f.getUser().getId() : null)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        if (employeeUserIds.isEmpty()) {
            return PartnerFeedbackSummaryDto.builder()
                    .partnerCompanyId(partner.getId())
                    .partnerCompanyName(partner.getCompanyName())
                    .averageRating(0.0)
                    .reviewCount(0L)
                    .feedbacks(Collections.emptyList())
                    .build();
        }

        List<Feedback> feedbacks = feedbackRepository.findByProfessionalIdInAndFeedbackTypeOrderByCreatedAtDesc(
                employeeUserIds, FeedbackType.PROFESSIONAL
        );
        Double avg = feedbackRepository.calculateAverageRatingForProfessionalIds(FeedbackType.PROFESSIONAL, employeeUserIds);
        Long count = (long) feedbacks.size();

        return PartnerFeedbackSummaryDto.builder()
                .partnerCompanyId(partner.getId())
                .partnerCompanyName(partner.getCompanyName())
                .averageRating(roundToOneDecimal(avg != null ? avg : 0.0))
                .reviewCount(count)
                .feedbacks(feedbacks.stream().map(this::mapToProfessionalFeedbackDto).collect(Collectors.toList()))
                .build();
    }

    // =========================================================================
    // HELPERS & MAPPERS
    // =========================================================================

    private void updateProfessionalAggregateRating(Long professionalUserId) {
        Double avg = feedbackRepository.calculateAverageRatingForProfessional(FeedbackType.PROFESSIONAL, professionalUserId);
        if (avg != null) {
            double rounded = roundToOneDecimal(avg);
            professionalProfileRepository.findByUserId(professionalUserId).ifPresent(profile -> {
                profile.setRating(rounded);
                professionalProfileRepository.save(profile);
            });
        }
    }

    private User resolveProfessionalUser(Long idOrUserId) {
        Freelancer fl = freelancerRepository.findById(idOrUserId).orElse(null);
        if (fl != null && fl.getUser() != null) {
            return fl.getUser();
        }
        return userRepository.findById(idOrUserId).orElse(null);
    }

    private Set<Long> getPartnerEmployeeUserIds() {
        return freelancerRepository.findAll().stream()
                .filter(f -> f.getPartnerCompanyId() != null && f.getUser() != null)
                .map(f -> f.getUser().getId())
                .collect(Collectors.toSet());
    }

    public CompanyFeedbackDto mapToCompanyFeedbackDto(Feedback feedback) {
        if (feedback == null) return null;

        String clientCompanyName = null;
        if (feedback.getClient() != null) {
            clientCompanyName = clientRepository.findByUserId(feedback.getClient().getId())
                    .map(Client::getCompanyName)
                    .orElse(null);
        }

        return CompanyFeedbackDto.builder()
                .id(feedback.getId())
                .projectId(feedback.getProject() != null ? feedback.getProject().getId() : null)
                .projectTitle(feedback.getProject() != null ? feedback.getProject().getTitle() : null)
                .clientId(feedback.getClient() != null ? feedback.getClient().getId() : null)
                .clientName(feedback.getClient() != null ? feedback.getClient().getFullName() : null)
                .clientCompanyName(clientCompanyName)
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedAt())
                .build();
    }

    public ProfessionalFeedbackDto mapToProfessionalFeedbackDto(Feedback feedback) {
        if (feedback == null) return null;

        User profUser = feedback.getProfessional();
        ProfessionalMetadata meta = resolveProfessionalMetadata(profUser);

        String clientCompanyName = null;
        if (feedback.getClient() != null) {
            clientCompanyName = clientRepository.findByUserId(feedback.getClient().getId())
                    .map(Client::getCompanyName)
                    .orElse(null);
        }

        // Project role if found in allocation
        String roleInProject = "Specialist";
        if (feedback.getProject() != null && profUser != null) {
            Optional<WorkforceAllocation> alloc = workforceAllocationRepository.findByProjectIdAndProfessionalId(
                    feedback.getProject().getId(), profUser.getId()
            );
            if (alloc.isPresent() && alloc.get().getRoleInProject() != null) {
                roleInProject = alloc.get().getRoleInProject();
            }
        }

        return ProfessionalFeedbackDto.builder()
                .id(feedback.getId())
                .projectId(feedback.getProject() != null ? feedback.getProject().getId() : null)
                .projectTitle(feedback.getProject() != null ? feedback.getProject().getTitle() : null)
                .clientId(feedback.getClient() != null ? feedback.getClient().getId() : null)
                .clientName(feedback.getClient() != null ? feedback.getClient().getFullName() : null)
                .clientCompanyName(clientCompanyName)
                .professionalId(profUser != null ? profUser.getId() : null)
                .professionalName(meta.name != null ? meta.name : (profUser != null ? profUser.getFullName() : "Specialist"))
                .professionalEmail(profUser != null ? profUser.getEmail() : "")
                .workforceType(meta.workforceType)
                .partnerCompanyId(meta.partnerCompanyId)
                .partnerCompanyName(meta.partnerCompanyName)
                .roleInProject(roleInProject)
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedAt())
                .build();
    }

    private ProfessionalMetadata resolveProfessionalMetadata(User profUser) {
        ProfessionalMetadata meta = new ProfessionalMetadata();
        if (profUser == null) return meta;

        Freelancer fl = freelancerRepository.findByUserId(profUser.getId())
                .or(() -> freelancerRepository.findByEmailIgnoreCase(profUser.getEmail()))
                .orElse(null);

        if (fl != null) {
            meta.name = fl.getName();
            if (fl.getPartnerCompanyId() != null) {
                PartnerCompany pc = partnerCompanyRepository.findById(fl.getPartnerCompanyId())
                        .orElseGet(() -> partnerCompanyRepository.findByUserId(fl.getPartnerCompanyId()).orElse(null));
                if (pc != null) {
                    meta.partnerCompanyId = pc.getId();
                    meta.partnerCompanyName = pc.getCompanyName();
                    meta.workforceType = "Partner Company";
                    return meta;
                }
            }
        }

        meta.workforceType = "Independent Freelancer";
        return meta;
    }

    private static class ProfessionalMetadata {
        String name;
        String workforceType = "Independent Freelancer";
        Long partnerCompanyId;
        String partnerCompanyName;
    }

    private boolean isAcceptedAllocation(WorkforceAllocation allocation) {
        if (allocation == null || allocation.getStatus() == null) return false;
        AllocationStatus status = allocation.getStatus();
        return status == AllocationStatus.ACCEPTED ||
               status == AllocationStatus.ASSIGNED ||
               status == AllocationStatus.ACTIVE ||
               status == AllocationStatus.RELEASED;
    }

    private double roundToOneDecimal(double val) {
        return BigDecimal.valueOf(val).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
