package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.CreatePayoutRequest;
import com.flexistaff.backend.dto.request.ExecutePayoutRequest;
import com.flexistaff.backend.dto.response.*;
import com.flexistaff.backend.entity.*;
import com.flexistaff.backend.entity.enums.*;
import com.flexistaff.backend.exception.BadRequestException;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.exception.UnauthorizedException;
import com.flexistaff.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.flexistaff.backend.config.RazorpayConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayoutService {

    private final PayoutRepository payoutRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final MilestoneRepository milestoneRepository;
    private final WorkforceAllocationRepository workforceAllocationRepository;
    private final FreelancerRepository freelancerRepository;
    private final PartnerCompanyRepository partnerCompanyRepository;
    private final RazorpayConfig razorpayConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<EligiblePayoutDto> calculateEligiblePayouts(Long projectId, String filterTalentType) {
        List<Project> projects;
        if (projectId != null) {
            Project p = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
            projects = List.of(p);
        } else {
            projects = projectRepository.findAll();
        }

        List<EligiblePayoutDto> results = new ArrayList<>();

        for (Project proj : projects) {
            if (proj.getStatus() == ProjectStatus.REJECTED ||
                proj.getStatus() == ProjectStatus.DECLINED ||
                proj.getStatus() == ProjectStatus.CANCELLED) {
                continue;
            }

            List<WorkforceAllocation> allocations = workforceAllocationRepository.findByProjectId(proj.getId());
            List<Milestone> milestones = milestoneRepository.findByProjectId(proj.getId());

            // Calculate approved milestone ratio
            double totalWeightage = 0.0;
            double approvedWeightage = 0.0;
            List<EligibleMilestoneDto> milestoneDtos = new ArrayList<>();

            for (Milestone m : milestones) {
                double weight = m.getWeightage() != null && m.getWeightage() > 0 ? m.getWeightage() : 20.0;
                totalWeightage += weight;
                boolean isCompleted = m.getStatus() == MilestoneStatus.COMPLETED ||
                        (m.getProgressPercentage() != null && m.getProgressPercentage() >= 100);

                if (isCompleted) {
                    approvedWeightage += weight;
                }

                BigDecimal paidForMilestone = payoutRepository.sumPaidAmountByMilestoneId(m.getId());
                if (paidForMilestone == null) paidForMilestone = BigDecimal.ZERO;

                milestoneDtos.add(EligibleMilestoneDto.builder()
                        .milestoneId(m.getId())
                        .title(m.getTitle())
                        .weightage(weight)
                        .status(m.getStatus() != null ? m.getStatus().name() : "NOT_STARTED")
                        .progressPercentage(m.getProgressPercentage() != null ? m.getProgressPercentage() : 0)
                        .milestoneEarnings(BigDecimal.ZERO) // set per talent below
                        .alreadyPaidForMilestone(paidForMilestone)
                        .pendingForMilestone(BigDecimal.ZERO)
                        .approved(isCompleted)
                        .build());
            }

            double approvedRatio = totalWeightage > 0
                    ? Math.min(1.0, approvedWeightage / totalWeightage)
                    : (proj.getStatus() == ProjectStatus.COMPLETED ? 1.0 : 0.0);

            for (WorkforceAllocation alloc : allocations) {
                User talent = alloc.getProfessional();
                if (talent == null) continue;

                // Identify whether talent is Partner Professional or Independent Freelancer
                Optional<Freelancer> freelancerOpt = freelancerRepository.findByUserId(talent.getId());
                boolean isPartnerEmployee = (talent.getProfessionalProfile() != null && talent.getProfessionalProfile().getPartnerCompany() != null)
                        || (freelancerOpt.isPresent() && freelancerOpt.get().getPartnerCompanyId() != null);

                String talentType = isPartnerEmployee ? "PROFESSIONAL" : "FREELANCER";

                if (filterTalentType != null && !filterTalentType.trim().isEmpty() &&
                        !filterTalentType.equalsIgnoreCase(talentType) &&
                        !filterTalentType.equalsIgnoreCase("ALL")) {
                    continue;
                }

                Long partnerCompId = null;
                String partnerCompName = null;
                if (isPartnerEmployee) {
                    if (talent.getProfessionalProfile() != null && talent.getProfessionalProfile().getPartnerCompany() != null) {
                        partnerCompId = talent.getProfessionalProfile().getPartnerCompany().getId();
                        partnerCompName = talent.getProfessionalProfile().getPartnerCompany().getCompanyName();
                    } else if (freelancerOpt.isPresent() && freelancerOpt.get().getPartnerCompanyId() != null) {
                        partnerCompId = freelancerOpt.get().getPartnerCompanyId();
                        partnerCompName = partnerCompanyRepository.findById(partnerCompId)
                                .map(PartnerCompany::getCompanyName).orElse("Partner Organization");
                    }
                }

                // Calculate Agreed Compensation
                BigDecimal billableRate = alloc.getBillableRate();
                if (billableRate == null && freelancerOpt.isPresent()) {
                    billableRate = freelancerOpt.get().getHourlyRate();
                }
                if (billableRate == null) {
                    billableRate = new BigDecimal("100.00");
                }

                int hours = alloc.getAllocatedHoursPerWeek() != null && alloc.getAllocatedHoursPerWeek() > 0
                        ? alloc.getAllocatedHoursPerWeek()
                        : 40;

                BigDecimal agreedCompensation = billableRate.multiply(BigDecimal.valueOf(hours))
                        .setScale(2, RoundingMode.HALF_UP);

                // If agreed compensation exceeds project budget and budget exists, cap proportionally
                if (proj.getBudget() != null && proj.getBudget().compareTo(BigDecimal.ZERO) > 0) {
                    if (agreedCompensation.compareTo(proj.getBudget()) > 0) {
                        agreedCompensation = proj.getBudget().setScale(2, RoundingMode.HALF_UP);
                    }
                }

                // Approved earnings = agreedCompensation * approvedRatio
                BigDecimal approvedEarnings = agreedCompensation
                        .multiply(BigDecimal.valueOf(approvedRatio))
                        .setScale(2, RoundingMode.HALF_UP);

                BigDecimal previouslyPaid = payoutRepository.sumPaidAmountByRecipientIdAndProjectId(talent.getId(), proj.getId());
                if (previouslyPaid == null) previouslyPaid = BigDecimal.ZERO;

                BigDecimal pendingPayout = approvedEarnings.subtract(previouslyPaid);
                if (pendingPayout.compareTo(BigDecimal.ZERO) < 0) {
                    pendingPayout = BigDecimal.ZERO;
                }

                boolean eligible = true;
                String ineligibilityReason = null;

                if (approvedWeightage <= 0 && proj.getStatus() != ProjectStatus.COMPLETED) {
                    eligible = false;
                    ineligibilityReason = "No approved / completed milestones for this project yet.";
                } else if (pendingPayout.compareTo(BigDecimal.ZERO) <= 0) {
                    eligible = false;
                    ineligibilityReason = "All approved earnings have already been fully paid.";
                } else if (alloc.getStatus() == AllocationStatus.CANCELLED || alloc.getStatus() == AllocationStatus.REJECTED) {
                    eligible = false;
                    ineligibilityReason = "Workforce allocation is cancelled or rejected.";
                }

                // Clone milestone list with talent specific figures
                List<EligibleMilestoneDto> talentMilestones = new ArrayList<>();
                for (EligibleMilestoneDto mDto : milestoneDtos) {
                    double mWeight = mDto.getWeightage();
                    double ratio = totalWeightage > 0 ? (mWeight / totalWeightage) : 0.0;
                    BigDecimal mEarnings = agreedCompensation.multiply(BigDecimal.valueOf(ratio)).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal mPaid = mDto.getAlreadyPaidForMilestone();
                    BigDecimal mPending = mDto.isApproved() ? mEarnings.subtract(mPaid) : BigDecimal.ZERO;
                    if (mPending.compareTo(BigDecimal.ZERO) < 0) mPending = BigDecimal.ZERO;

                    talentMilestones.add(EligibleMilestoneDto.builder()
                            .milestoneId(mDto.getMilestoneId())
                            .title(mDto.getTitle())
                            .weightage(mDto.getWeightage())
                            .status(mDto.getStatus())
                            .progressPercentage(mDto.getProgressPercentage())
                            .milestoneEarnings(mEarnings)
                            .alreadyPaidForMilestone(mPaid)
                            .pendingForMilestone(mPending)
                            .approved(mDto.isApproved())
                            .build());
                }

                results.add(EligiblePayoutDto.builder()
                        .talentUserId(talent.getId())
                        .freelancerId(freelancerOpt.map(Freelancer::getId).orElse(null))
                        .name(talent.getFullName())
                        .email(talent.getEmail())
                        .talentType(talentType)
                        .partnerCompanyId(partnerCompId)
                        .partnerCompanyName(partnerCompName)
                        .projectId(proj.getId())
                        .projectTitle(proj.getTitle())
                        .projectStatus(proj.getStatus() != null ? proj.getStatus().name() : "")
                        .allocationId(alloc.getId())
                        .allocationStatus(alloc.getStatus() != null ? alloc.getStatus().name() : "")
                        .roleInProject(alloc.getRoleInProject() != null ? alloc.getRoleInProject() : "Specialist")
                        .billableRate(billableRate)
                        .allocatedHoursPerWeek(hours)
                        .agreedCompensation(agreedCompensation)
                        .approvedMilestonePercentage(Math.round(approvedRatio * 1000.0) / 10.0)
                        .approvedEarnings(approvedEarnings)
                        .previouslyPaid(previouslyPaid)
                        .pendingPayout(pendingPayout)
                        .eligible(eligible)
                        .ineligibilityReason(ineligibilityReason)
                        .approvedMilestones(talentMilestones)
                        .build());
            }
        }

        return results;
    }

    @Transactional
    public PayoutDto createPayout(CreatePayoutRequest request, Long adminUserId) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        if (project.getStatus() == ProjectStatus.REJECTED ||
            project.getStatus() == ProjectStatus.DECLINED ||
            project.getStatus() == ProjectStatus.CANCELLED) {
            throw new BadRequestException("Cannot create payout for a rejected or cancelled project.");
        }

        User talent = userRepository.findById(request.getTalentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getTalentUserId()));

        User admin = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;

        WorkforceAllocation allocation = workforceAllocationRepository
                .findByProjectIdAndProfessionalId(project.getId(), talent.getId())
                .orElse(null);

        Milestone milestone = null;
        if (request.getMilestoneId() != null) {
            milestone = milestoneRepository.findById(request.getMilestoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Milestone", "id", request.getMilestoneId()));
            if (!milestone.getProject().getId().equals(project.getId())) {
                throw new BadRequestException("Selected milestone does not belong to project ID " + project.getId());
            }
            if (milestone.getStatus() != MilestoneStatus.COMPLETED &&
                    (milestone.getProgressPercentage() == null || milestone.getProgressPercentage() < 100)) {
                throw new BadRequestException("Cannot release payout for milestone '" + milestone.getTitle() + "' because it is not completed and approved.");
            }
        }

        // Determine if Partner Professional or Freelancer
        Optional<Freelancer> freelancerOpt = freelancerRepository.findByUserId(talent.getId());
        boolean isPartnerEmployee = (talent.getProfessionalProfile() != null && talent.getProfessionalProfile().getPartnerCompany() != null)
                || (freelancerOpt.isPresent() && freelancerOpt.get().getPartnerCompanyId() != null);

        PayoutType payoutType = isPartnerEmployee ? PayoutType.PROFESSIONAL_PAYOUT : PayoutType.FREELANCER_PAYOUT;

        PartnerCompany partnerCompany = null;
        if (isPartnerEmployee) {
            if (talent.getProfessionalProfile() != null && talent.getProfessionalProfile().getPartnerCompany() != null) {
                partnerCompany = talent.getProfessionalProfile().getPartnerCompany();
            } else if (freelancerOpt.isPresent() && freelancerOpt.get().getPartnerCompanyId() != null) {
                partnerCompany = partnerCompanyRepository.findById(freelancerOpt.get().getPartnerCompanyId()).orElse(null);
            }
        }

        // Validate amount against pending eligible balance
        List<EligiblePayoutDto> eligibilityList = calculateEligiblePayouts(project.getId(), null);
        EligiblePayoutDto eligibility = eligibilityList.stream()
                .filter(e -> e.getTalentUserId().equals(talent.getId()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Talent is not allocated to project ID " + project.getId()));

        if (!eligibility.isEligible()) {
            throw new BadRequestException("Talent is not eligible for payout: " + eligibility.getIneligibilityReason());
        }

        BigDecimal requestedAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
        if (requestedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payout amount must be greater than zero.");
        }

        if (requestedAmount.compareTo(eligibility.getPendingPayout()) > 0) {
            throw new BadRequestException("Payout amount of ₹" + requestedAmount +
                    " exceeds outstanding approved balance of ₹" + eligibility.getPendingPayout());
        }

        BigDecimal fee = request.getFee() != null ? request.getFee().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal deductions = request.getDeductions() != null ? request.getDeductions().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal netAmount = requestedAmount.subtract(fee).subtract(deductions);
        if (netAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Net payout amount must be greater than zero after fees and deductions.");
        }

        String refNo = "PO-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        boolean markCompleted = Boolean.TRUE.equals(request.getMarkAsCompleted());
        PayoutStatus initialStatus = markCompleted ? PayoutStatus.COMPLETED : PayoutStatus.PENDING_APPROVAL;
        LocalDateTime now = LocalDateTime.now();

        // If disbursed directly via Razorpay Checkout
        if ((request.getRazorpayPaymentId() != null || (request.getGatewayTransactionId() != null && request.getGatewayTransactionId().startsWith("pay_")))
                || (request.getPayoutMethod() != null && request.getPayoutMethod().contains("Razorpay"))) {
            String payId = request.getRazorpayPaymentId() != null ? request.getRazorpayPaymentId() : request.getGatewayTransactionId();
            if (payId == null || payId.isBlank()) {
                payId = "pay_rzp_" + System.currentTimeMillis();
            }
            if (request.getRazorpayOrderId() != null && request.getRazorpaySignature() != null && !request.getRazorpaySignature().isBlank()) {
                boolean valid = razorpayConfig.verifyPaymentSignature(
                        request.getRazorpayOrderId(),
                        payId,
                        request.getRazorpaySignature()
                );
                if (!valid) {
                    throw new BadRequestException("Razorpay payment signature verification failed.");
                }
            }
            request.setPayoutMethod("Razorpay Instant Payout");
            request.setGatewayTransactionId(payId);
            markCompleted = true;
            initialStatus = PayoutStatus.COMPLETED;
        }

        String initiatedByName = admin != null ? admin.getFullName() : "Administrator";
        String auditEntry = String.format("[%s] Payout created with status %s by %s. Gross: ₹%s, Net: ₹%s. Method: %s.",
                now.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                initialStatus.name(),
                initiatedByName,
                requestedAmount,
                netAmount,
                request.getPayoutMethod());

        if (markCompleted && request.getGatewayTransactionId() != null) {
            auditEntry += " External Ref: " + request.getGatewayTransactionId();
        }

        Payout payout = Payout.builder()
                .project(project)
                .milestone(milestone)
                .allocation(allocation)
                .recipient(talent)
                .partnerCompany(partnerCompany)
                .recipientRole(talent.getRole())
                .payoutType(payoutType)
                .grossAmount(requestedAmount)
                .fee(fee)
                .deductions(deductions)
                .netAmount(netAmount)
                .currency("INR")
                .status(initialStatus)
                .payoutMethod(request.getPayoutMethod())
                .referenceNumber(refNo)
                .gatewayTransactionId(request.getGatewayTransactionId())
                .notes(request.getNotes())
                .initiatedBy(admin)
                .approvedBy(markCompleted ? admin : null)
                .initiatedAt(now)
                .approvedAt(markCompleted ? now : null)
                .completedAt(markCompleted ? now : null)
                .auditTrail(auditEntry)
                .build();

        Payout saved = payoutRepository.save(payout);
        log.info("Created payout ID {} [ref: {}] with status {} for user {}", saved.getId(), refNo, saved.getStatus(), talent.getEmail());

        return mapToPayoutDto(saved);
    }

    @Transactional
    public PayoutDto approvePayout(Long payoutId, Long adminUserId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout", "id", payoutId));

        if (payout.getStatus() != PayoutStatus.PENDING_APPROVAL && payout.getStatus() != PayoutStatus.DRAFT) {
            throw new BadRequestException("Only payouts with PENDING_APPROVAL or DRAFT status can be approved. Current status: " + payout.getStatus());
        }

        User admin = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;
        LocalDateTime now = LocalDateTime.now();

        payout.setStatus(PayoutStatus.APPROVED);
        payout.setApprovedBy(admin);
        payout.setApprovedAt(now);

        String audit = payout.getAuditTrail() != null ? payout.getAuditTrail() + "\n" : "";
        audit += String.format("[%s] Payout approved by %s.",
                now.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                admin != null ? admin.getFullName() : "Admin");
        payout.setAuditTrail(audit);

        Payout saved = payoutRepository.save(payout);
        log.info("Approved payout ID {} by admin {}", payoutId, admin != null ? admin.getEmail() : "Unknown");
        return mapToPayoutDto(saved);
    }

    @Transactional
    public PayoutDto executePayout(Long payoutId, ExecutePayoutRequest request, Long adminUserId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout", "id", payoutId));

        if (payout.getStatus() == PayoutStatus.COMPLETED) {
            log.info("Payout ID {} is already COMPLETED", payoutId);
            return mapToPayoutDto(payout);
        }

        if (payout.getStatus() != PayoutStatus.APPROVED && payout.getStatus() != PayoutStatus.PENDING_APPROVAL && payout.getStatus() != PayoutStatus.PROCESSING) {
            throw new BadRequestException("Payout cannot be executed from status: " + payout.getStatus());
        }

        User admin = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;
        LocalDateTime now = LocalDateTime.now();

        if (request.getPayoutMethod() != null && !request.getPayoutMethod().isBlank()) {
            payout.setPayoutMethod(request.getPayoutMethod().trim());
        }
        if (request.getGatewayTransactionId() != null && !request.getGatewayTransactionId().isBlank()) {
            payout.setGatewayTransactionId(request.getGatewayTransactionId().trim());
        }
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            payout.setNotes(payout.getNotes() != null ? payout.getNotes() + " | " + request.getNotes() : request.getNotes());
        }

        payout.setStatus(PayoutStatus.COMPLETED);
        payout.setCompletedAt(now);
        if (payout.getApprovedBy() == null && admin != null) {
            payout.setApprovedBy(admin);
            payout.setApprovedAt(now);
        }

        String audit = payout.getAuditTrail() != null ? payout.getAuditTrail() + "\n" : "";
        audit += String.format("[%s] Payout marked COMPLETED by %s. Gateway Ref/UTR: %s.",
                now.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                admin != null ? admin.getFullName() : "Admin",
                payout.getGatewayTransactionId() != null ? payout.getGatewayTransactionId() : "Manual Wire");
        payout.setAuditTrail(audit);

        Payout saved = payoutRepository.save(payout);
        log.info("Executed and completed payout ID {} for net amount ₹{}", payoutId, saved.getNetAmount());
        return mapToPayoutDto(saved);
    }

    @Transactional
    public PayoutDto cancelPayout(Long payoutId, String reason, Long adminUserId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout", "id", payoutId));

        if (payout.getStatus() == PayoutStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed payout. Use a reversal adjustment instead.");
        }

        User admin = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;
        LocalDateTime now = LocalDateTime.now();

        payout.setStatus(PayoutStatus.CANCELLED);
        payout.setFailureReason(reason != null && !reason.isBlank() ? reason : "Cancelled by administrator");

        String audit = payout.getAuditTrail() != null ? payout.getAuditTrail() + "\n" : "";
        audit += String.format("[%s] Payout cancelled by %s. Reason: %s.",
                now.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                admin != null ? admin.getFullName() : "Admin",
                payout.getFailureReason());
        payout.setAuditTrail(audit);

        Payout saved = payoutRepository.save(payout);
        log.info("Cancelled payout ID {} with reason: {}", payoutId, reason);
        return mapToPayoutDto(saved);
    }

    @Transactional(readOnly = true)
    public PayoutDto getPayoutById(Long payoutId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout", "id", payoutId));
        return mapToPayoutDto(payout);
    }

    @Transactional(readOnly = true)
    public PayoutReceiptDto getPayoutReceipt(Long payoutId, Long currentUserId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout", "id", payoutId));

        validatePayoutAccess(payout, currentUserId);

        User recipient = payout.getRecipient();
        PartnerCompany partner = payout.getPartnerCompany();
        String partnerName = partner != null ? partner.getCompanyName() : "Independent Freelancer";

        return PayoutReceiptDto.builder()
                .receiptNumber(payout.getReferenceNumber())
                .payoutId(payout.getId())
                .payoutType(payout.getPayoutType().name())
                .projectId(payout.getProject().getId())
                .projectTitle(payout.getProject().getTitle())
                .milestoneId(payout.getMilestone() != null ? payout.getMilestone().getId() : null)
                .milestoneTitle(payout.getMilestone() != null ? payout.getMilestone().getTitle() : "Sprint Allocation Payout")
                .recipientId(recipient.getId())
                .recipientName(recipient.getFullName())
                .recipientEmail(recipient.getEmail())
                .recipientRole(payout.getRecipientRole() != null ? payout.getRecipientRole().name() : "ROLE_PROFESSIONAL")
                .partnerCompanyName(partnerName)
                .grossAmount(payout.getGrossAmount().setScale(2, RoundingMode.HALF_UP))
                .fee(payout.getFee().setScale(2, RoundingMode.HALF_UP))
                .deductions(payout.getDeductions().setScale(2, RoundingMode.HALF_UP))
                .netAmount(payout.getNetAmount().setScale(2, RoundingMode.HALF_UP))
                .currency(payout.getCurrency())
                .payoutMethod(payout.getPayoutMethod() != null ? payout.getPayoutMethod() : "Bank Transfer (NEFT/RTGS)")
                .gatewayTransactionId(payout.getGatewayTransactionId() != null ? payout.getGatewayTransactionId() : "N/A")
                .status(payout.getStatus().name())
                .completedAt(payout.getCompletedAt() != null ? payout.getCompletedAt() : payout.getCreatedAt())
                .issuedAt(LocalDateTime.now())
                .issuedBy("FlexiStaff Technologies Pvt Ltd")
                .notes(payout.getNotes())
                .build();
    }

    @Transactional(readOnly = true)
    public TalentEarningsSummaryDto getTalentEarningsSummary(Long currentUserId) {
        User talent = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        Optional<Freelancer> freelancerOpt = freelancerRepository.findByUserId(talent.getId());
        boolean isPartnerEmployee = (talent.getProfessionalProfile() != null && talent.getProfessionalProfile().getPartnerCompany() != null)
                || (freelancerOpt.isPresent() && freelancerOpt.get().getPartnerCompanyId() != null);

        String talentType = isPartnerEmployee ? "PROFESSIONAL" : "FREELANCER";
        String partnerName = null;
        if (isPartnerEmployee) {
            if (talent.getProfessionalProfile() != null && talent.getProfessionalProfile().getPartnerCompany() != null) {
                partnerName = talent.getProfessionalProfile().getPartnerCompany().getCompanyName();
            } else if (freelancerOpt.isPresent() && freelancerOpt.get().getPartnerCompanyId() != null) {
                partnerName = partnerCompanyRepository.findById(freelancerOpt.get().getPartnerCompanyId())
                        .map(PartnerCompany::getCompanyName).orElse("Partner Organization");
            }
        }

        // Aggregate across all projects where talent is allocated
        List<WorkforceAllocation> allocations = workforceAllocationRepository.findByProfessionalId(talent.getId());
        BigDecimal totalApproved = BigDecimal.ZERO;
        List<ProjectTalentEarningDto> projectEarnings = new ArrayList<>();

        for (WorkforceAllocation alloc : allocations) {
            Project proj = alloc.getProject();
            if (proj == null) continue;

            List<Milestone> milestones = milestoneRepository.findByProjectId(proj.getId());
            double totalWeight = 0.0;
            double appWeight = 0.0;
            for (Milestone m : milestones) {
                double w = m.getWeightage() != null && m.getWeightage() > 0 ? m.getWeightage() : 20.0;
                totalWeight += w;
                if (m.getStatus() == MilestoneStatus.COMPLETED ||
                        (m.getProgressPercentage() != null && m.getProgressPercentage() >= 100)) {
                    appWeight += w;
                }
            }
            double ratio = totalWeight > 0 ? Math.min(1.0, appWeight / totalWeight) : (proj.getStatus() == ProjectStatus.COMPLETED ? 1.0 : 0.0);

            BigDecimal rate = alloc.getBillableRate() != null ? alloc.getBillableRate() : new BigDecimal("100.00");
            int hours = alloc.getAllocatedHoursPerWeek() != null && alloc.getAllocatedHoursPerWeek() > 0 ? alloc.getAllocatedHoursPerWeek() : 40;
            BigDecimal agreed = rate.multiply(BigDecimal.valueOf(hours)).setScale(2, RoundingMode.HALF_UP);
            if (proj.getBudget() != null && proj.getBudget().compareTo(BigDecimal.ZERO) > 0 && agreed.compareTo(proj.getBudget()) > 0) {
                agreed = proj.getBudget().setScale(2, RoundingMode.HALF_UP);
            }

            BigDecimal approved = agreed.multiply(BigDecimal.valueOf(ratio)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal paid = payoutRepository.sumPaidAmountByRecipientIdAndProjectId(talent.getId(), proj.getId());
            if (paid == null) paid = BigDecimal.ZERO;

            BigDecimal pending = approved.subtract(paid);
            if (pending.compareTo(BigDecimal.ZERO) < 0) pending = BigDecimal.ZERO;

            totalApproved = totalApproved.add(approved);

            projectEarnings.add(ProjectTalentEarningDto.builder()
                    .projectId(proj.getId())
                    .projectTitle(proj.getTitle())
                    .projectStatus(proj.getStatus() != null ? proj.getStatus().name() : "")
                    .agreedCompensation(agreed)
                    .approvedMilestonePercentage(Math.round(ratio * 1000.0) / 10.0)
                    .approvedEarnings(approved)
                    .paidAmount(paid)
                    .pendingAmount(pending)
                    .build());
        }

        BigDecimal totalPaid = payoutRepository.sumCompletedPaidByRecipientId(talent.getId());
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;

        BigDecimal totalDeductions = payoutRepository.sumCompletedDeductionsByRecipientId(talent.getId());
        if (totalDeductions == null) totalDeductions = BigDecimal.ZERO;

        // Pending payout is the remaining unpaid approved earnings across projects
        BigDecimal pendingPayout = projectEarnings.stream()
                .map(ProjectTalentEarningDto::getPendingAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (pendingPayout.compareTo(BigDecimal.ZERO) < 0) pendingPayout = BigDecimal.ZERO;

        BigDecimal processing = payoutRepository.sumProcessingByRecipientId(talent.getId());
        if (processing == null) processing = BigDecimal.ZERO;

        BigDecimal failed = payoutRepository.sumFailedByRecipientId(talent.getId());
        if (failed == null) failed = BigDecimal.ZERO;

        List<PayoutDto> recent = payoutRepository.findByRecipientIdOrderByCreatedAtDesc(talent.getId())
                .stream()
                .limit(10)
                .map(this::mapToPayoutDto)
                .collect(Collectors.toList());

        return TalentEarningsSummaryDto.builder()
                .talentUserId(talent.getId())
                .name(talent.getFullName())
                .email(talent.getEmail())
                .talentType(talentType)
                .partnerCompanyName(partnerName)
                .totalApprovedEarnings(totalApproved.setScale(2, RoundingMode.HALF_UP))
                .totalPaid(totalPaid.setScale(2, RoundingMode.HALF_UP))
                .totalDeductions(totalDeductions.setScale(2, RoundingMode.HALF_UP))
                .pendingPayout(pendingPayout.setScale(2, RoundingMode.HALF_UP))
                .processingPayout(processing.setScale(2, RoundingMode.HALF_UP))
                .failedPayout(failed.setScale(2, RoundingMode.HALF_UP))
                .projectEarnings(projectEarnings)
                .recentPayouts(recent)
                .build();
    }

    @Transactional(readOnly = true)
    public List<PayoutDto> getTalentPayoutHistory(Long currentUserId) {
        return payoutRepository.findByRecipientIdOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(this::mapToPayoutDto)
                .collect(Collectors.toList());
    }

    private void validatePayoutAccess(Payout payout, Long currentUserId) {
        if (currentUserId == null) return;
        User current = userRepository.findById(currentUserId).orElse(null);
        if (current == null) return;

        String role = current.getRole() != null ? current.getRole().name() : "";
        if (role.contains("ADMIN") || role.contains("MANAGER")) {
            return;
        }

        if (!payout.getRecipient().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You are not authorized to view this payout record.");
        }
    }

    public PayoutDto mapToPayoutDto(Payout p) {
        Project proj = p.getProject();
        Milestone m = p.getMilestone();
        User rec = p.getRecipient();
        PartnerCompany pc = p.getPartnerCompany();
        User init = p.getInitiatedBy();
        User appr = p.getApprovedBy();

        return PayoutDto.builder()
                .id(p.getId())
                .projectId(proj != null ? proj.getId() : null)
                .projectTitle(proj != null ? proj.getTitle() : "Project")
                .milestoneId(m != null ? m.getId() : null)
                .milestoneTitle(m != null ? m.getTitle() : null)
                .recipientId(rec != null ? rec.getId() : null)
                .recipientName(rec != null ? rec.getFullName() : "Specialist")
                .recipientEmail(rec != null ? rec.getEmail() : "")
                .recipientRole(p.getRecipientRole() != null ? p.getRecipientRole().name() : "ROLE_PROFESSIONAL")
                .payoutType(p.getPayoutType() != null ? p.getPayoutType().name() : "PROFESSIONAL_PAYOUT")
                .partnerCompanyId(pc != null ? pc.getId() : null)
                .partnerCompanyName(pc != null ? pc.getCompanyName() : null)
                .grossAmount(p.getGrossAmount() != null ? p.getGrossAmount().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .fee(p.getFee() != null ? p.getFee().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .deductions(p.getDeductions() != null ? p.getDeductions().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .netAmount(p.getNetAmount() != null ? p.getNetAmount().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .currency(p.getCurrency())
                .status(p.getStatus() != null ? p.getStatus().name() : "PENDING")
                .payoutMethod(p.getPayoutMethod())
                .referenceNumber(p.getReferenceNumber())
                .gatewayTransactionId(p.getGatewayTransactionId())
                .notes(p.getNotes())
                .failureReason(p.getFailureReason())
                .initiatedByName(init != null ? init.getFullName() : "Admin")
                .approvedByName(appr != null ? appr.getFullName() : null)
                .initiatedAt(p.getInitiatedAt())
                .approvedAt(p.getApprovedAt())
                .completedAt(p.getCompletedAt())
                .createdAt(p.getCreatedAt())
                .auditTrail(p.getAuditTrail())
                .build();
    }

    @Transactional
    public PaymentOrderResponse createPayoutRazorpayOrder(CreatePayoutRequest request, Long adminUserId) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));
        User talent = userRepository.findById(request.getTalentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getTalentUserId()));

        BigDecimal requestedAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal fee = request.getFee() != null ? request.getFee().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal deductions = request.getDeductions() != null ? request.getDeductions().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal netAmount = requestedAmount.subtract(fee).subtract(deductions);
        if (netAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Net payout amount must be greater than zero after fees and deductions.");
        }

        long amountInPaise = netAmount.multiply(new BigDecimal(100)).longValueExact();
        String receiptNumber = "PO-RCP-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        if (!razorpayConfig.isConfigured()) {
            throw new BadRequestException("Razorpay credentials are not configured on the server.");
        }

        String orderId = callRazorpayCreateOrderForPayout(amountInPaise, receiptNumber, project, talent, netAmount);

        return PaymentOrderResponse.builder()
                .orderId(orderId)
                .amount(netAmount)
                .amountInPaise(amountInPaise)
                .currency(razorpayConfig.getCurrency())
                .keyId(razorpayConfig.getKeyId())
                .projectId(project.getId())
                .projectTitle(project.getTitle())
                .clientName(talent.getFullName())
                .clientEmail(talent.getEmail())
                .clientPhone(talent.getPhone())
                .companyName(razorpayConfig.getCompanyName())
                .receiptNumber(receiptNumber)
                .isTestMode(razorpayConfig.getKeyId().startsWith("rzp_test_"))
                .build();
    }

    private String callRazorpayCreateOrderForPayout(long amountInPaise, String receiptNumber, Project project, User talent, BigDecimal amount) {
        String url = "https://api.razorpay.com/v1/orders";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(razorpayConfig.getKeyId(), razorpayConfig.getKeySecret(), StandardCharsets.UTF_8);

        Map<String, Object> body = new HashMap<>();
        body.put("amount", amountInPaise);
        body.put("currency", razorpayConfig.getCurrency());
        body.put("receipt", receiptNumber);

        Map<String, String> notes = new HashMap<>();
        notes.put("type", "TALENT_PAYOUT");
        notes.put("projectId", String.valueOf(project.getId()));
        notes.put("projectTitle", project.getTitle());
        notes.put("talentUserId", String.valueOf(talent.getId()));
        notes.put("talentName", talent.getFullName());
        notes.put("payoutAmount", amount.toString());
        body.put("notes", notes);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        int maxAttempts = 3;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode json = objectMapper.readTree(response.getBody());
                    if (json.has("id")) {
                        return json.get("id").asText();
                    }
                }
                throw new BadRequestException("Razorpay did not return an order ID for payout");
            } catch (HttpStatusCodeException ex) {
                log.warn("Razorpay API order creation attempt {} returned HTTP {}: {}", attempt, ex.getStatusCode(), ex.getResponseBodyAsString());
                if (ex.getStatusCode().value() == 429 && attempt < maxAttempts) {
                    try {
                        Thread.sleep(800L * attempt);
                    } catch (InterruptedException ignored) {}
                    continue;
                }
                if (ex.getStatusCode().value() == 429) {
                    log.info("Razorpay order API rate-limited (HTTP 429), proceeding with standard direct checkout fallback");
                    return null;
                }
                try {
                    JsonNode errJson = objectMapper.readTree(ex.getResponseBodyAsString());
                    String rzpMsg = errJson.path("error").path("description").asText(ex.getMessage());
                    throw new BadRequestException("Razorpay error: " + rzpMsg);
                } catch (Exception e) {
                    throw new BadRequestException("Razorpay API error: " + ex.getMessage());
                }
            } catch (BadRequestException bre) {
                throw bre;
            } catch (Exception ex) {
                log.error("Error contacting Razorpay for payout order on attempt {}: {}", attempt, ex.getMessage());
                if (attempt < maxAttempts) {
                    try {
                        Thread.sleep(800L * attempt);
                    } catch (InterruptedException ignored) {}
                    continue;
                }
                throw new BadRequestException("Unable to contact Razorpay payment gateway: " + ex.getMessage());
            }
        }
        return null;
    }
}
