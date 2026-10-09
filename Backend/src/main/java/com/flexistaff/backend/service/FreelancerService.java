package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.FreelancerRegistrationRequest;
import com.flexistaff.backend.dto.request.UpdateFreelancerRequest;
import com.flexistaff.backend.dto.response.FreelancerDto;
import com.flexistaff.backend.entity.Freelancer;
import com.flexistaff.backend.entity.ProfessionalProfile;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.exception.BadRequestException;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.entity.Client;
import com.flexistaff.backend.entity.Project;
import com.flexistaff.backend.entity.WorkforceAllocation;
import com.flexistaff.backend.entity.enums.AllocationStatus;
import com.flexistaff.backend.entity.enums.ProjectStatus;
import com.flexistaff.backend.repository.ClientRepository;
import com.flexistaff.backend.repository.FreelancerRepository;
import com.flexistaff.backend.repository.ProfessionalProfileRepository;
import com.flexistaff.backend.repository.UserRepository;
import com.flexistaff.backend.repository.WorkforceAllocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FreelancerService {

    private final UserRepository userRepository;
    private final FreelancerRepository freelancerRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final ClientRepository clientRepository;
    private final com.flexistaff.backend.repository.PartnerCompanyRepository partnerCompanyRepository;
    private final WorkforceAllocationRepository workforceAllocationRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.flexistaff.backend.config.DatabaseSequenceRepairRunner sequenceRepairRunner;

    @Transactional
    public FreelancerDto registerFreelancer(FreelancerRegistrationRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email) || freelancerRepository.existsByEmailIgnoreCase(email) || clientRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email address already registered: " + email);
        }

        // Independent freelancers register with "Pending Review" status and require Admin approval before login
        boolean isPartnerEmployee = request.getPartnerCompanyId() != null;
        boolean initialActive = isPartnerEmployee;
        String initialStatus = isPartnerEmployee ? "Active" : "Pending Review";

        // 1. Create and save central User entity (PostgreSQL generates unique auto-increment ID)
        User user = User.builder()
                .fullName(request.getFullName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.ROLE_PROFESSIONAL)
                .active(initialActive)
                .build();

        User savedUser;
        try {
            savedUser = userRepository.save(user);
            userRepository.flush();
        } catch (Exception ex) {
            sequenceRepairRunner.repairDatabaseSequences();
            savedUser = userRepository.save(user);
            userRepository.flush();
        }

        // 2. Create and save Freelancer entity in "freelancers" table
        Freelancer freelancer = Freelancer.builder()
                .user(savedUser)
                .name(request.getFullName())
                .email(email)
                .phone(request.getPhone())
                .password(savedUser.getPassword())
                .title(request.getTitle() != null ? request.getTitle() : "Software Professional")
                .skills(request.getSkills())
                .bio(request.getBio())
                .experienceYears(request.getExperienceYears())
                .hourlyRate(request.getHourlyRate())
                .availabilityStatus(request.getAvailabilityStatus() != null ? request.getAvailabilityStatus() : "Available")
                .partnerCompanyId(request.getPartnerCompanyId())
                .status(initialStatus)
                .build();

        Freelancer savedFreelancer = freelancerRepository.save(freelancer);

        // 3. Also save ProfessionalProfile entity for backward compatibility
        ProfessionalProfile profile = ProfessionalProfile.builder()
                .user(savedUser)
                .title(freelancer.getTitle())
                .skills(freelancer.getSkills())
                .bio(freelancer.getBio())
                .experienceYears(freelancer.getExperienceYears())
                .hourlyRate(freelancer.getHourlyRate())
                .availabilityStatus(freelancer.getAvailabilityStatus())
                .build();
        professionalProfileRepository.save(profile);

        return mapToDto(savedFreelancer);
    }

    @Transactional(readOnly = true)
    public List<FreelancerDto> getFreelancersByPartnerCompany(Long partnerCompanyId) {
        if (partnerCompanyId == null) return new java.util.ArrayList<>();
        return freelancerRepository.findByPartnerCompanyId(partnerCompanyId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FreelancerDto> getAllFreelancers() {
        List<Freelancer> freelancers = freelancerRepository.findAll();
        List<FreelancerDto> dtos = new java.util.ArrayList<>();

        java.util.Set<String> existingEmails = new java.util.HashSet<>();
        java.util.Set<Long> existingUserIds = new java.util.HashSet<>();

        for (Freelancer f : freelancers) {
            if (f == null) continue;
            User user = f.getUser();
            if (user == null && f.getEmail() != null && !f.getEmail().isBlank()) {
                user = userRepository.findByEmailIgnoreCase(f.getEmail().trim()).orElse(null);
            }

            if (user != null) {
                if (user.getId() != null) existingUserIds.add(user.getId());
                if (user.getEmail() != null) existingEmails.add(user.getEmail().toLowerCase().trim());
            } else if (f.getEmail() != null) {
                existingEmails.add(f.getEmail().toLowerCase().trim());
            }

            FreelancerDto dto = mapToDto(f);
            if (dto != null) {
                dtos.add(dto);
            }
        }

        List<User> proUsers = userRepository.findByRole(Role.ROLE_PROFESSIONAL);
        for (User u : proUsers) {
            if (u != null && u.getId() != null && u.getEmail() != null) {
                String email = u.getEmail().toLowerCase().trim();
                if (!existingUserIds.contains(u.getId()) && !existingEmails.contains(email)) {
                    FreelancerDto dto = mapUserToDto(u);
                    if (dto != null) {
                        dtos.add(dto);
                        existingUserIds.add(u.getId());
                        existingEmails.add(email);
                    }
                }
            }
        }

        List<ProfessionalProfile> profiles = professionalProfileRepository.findAll();
        for (ProfessionalProfile prof : profiles) {
            if (prof != null && prof.getUser() != null) {
                User u = prof.getUser();
                if (u.getRole() == Role.ROLE_ADMIN || u.getRole() == Role.ROLE_CLIENT || u.getRole() == Role.ROLE_MANAGER) {
                    continue;
                }
                if (u.getId() != null && u.getEmail() != null) {
                    String email = u.getEmail().toLowerCase().trim();
                    if (!existingUserIds.contains(u.getId()) && !existingEmails.contains(email)) {
                        FreelancerDto dto = mapUserToDto(u);
                        if (dto != null) {
                            dtos.add(dto);
                            existingUserIds.add(u.getId());
                            existingEmails.add(email);
                        }
                    }
                }
            }
        }

        return dtos;
    }

    @Transactional(readOnly = true)
    public FreelancerDto getFreelancerById(Long id) {
        Freelancer freelancer = freelancerRepository.findById(id)
                .orElseGet(() -> freelancerRepository.findByUserId(id).orElse(null));
        if (freelancer != null) {
            return mapToDto(freelancer);
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer", "id", id));
        return mapUserToDto(user);
    }

    @Transactional
    public void deleteFreelancer(Long id) {
        if (id == null) return;
        Freelancer freelancer = freelancerRepository.findById(id)
                .or(() -> freelancerRepository.findByUserId(id))
                .orElse(null);

        User user = null;
        if (freelancer != null) {
            user = freelancer.getUser();
            if (user == null && freelancer.getEmail() != null) {
                user = userRepository.findByEmailIgnoreCase(freelancer.getEmail()).orElse(null);
            }
        } else {
            user = userRepository.findById(id).orElse(null);
            if (user != null) {
                final Long uId = user.getId();
                final String uEmail = user.getEmail();
                freelancer = freelancerRepository.findByUserId(uId)
                        .or(() -> freelancerRepository.findByEmailIgnoreCase(uEmail))
                        .orElse(null);
            }
        }

        if (freelancer == null && user == null) {
            return;
        }

        // 1. Delete associated workforce allocations and professional profiles
        if (user != null) {
            final Long targetUserId = user.getId();
            var allocations = workforceAllocationRepository.findByProfessionalId(targetUserId);
            if (!allocations.isEmpty()) {
                workforceAllocationRepository.deleteAll(allocations);
                workforceAllocationRepository.flush();
            }
            professionalProfileRepository.findByUserId(targetUserId).ifPresent(p -> {
                professionalProfileRepository.delete(p);
                professionalProfileRepository.flush();
            });
        }

        // 2. Delete freelancer record
        if (freelancer != null) {
            freelancerRepository.delete(freelancer);
            freelancerRepository.flush();
        }

        // 3. Delete user record
        if (user != null) {
            userRepository.delete(user);
            userRepository.flush();
        }
    }

    @Transactional
    public FreelancerDto updateFreelancer(Long id, UpdateFreelancerRequest request) {
        String targetName = request.getName() != null && !request.getName().isBlank()
                ? request.getName().trim()
                : (request.getFullName() != null ? request.getFullName().trim() : null);

        Freelancer freelancer = freelancerRepository.findById(id).orElse(null);
        if (freelancer == null) {
            freelancer = freelancerRepository.findByUserId(id).orElse(null);
        }
        if (freelancer == null && request.getEmail() != null && !request.getEmail().isBlank()) {
            freelancer = freelancerRepository.findByEmailIgnoreCase(request.getEmail().trim()).orElse(null);
        }

        User user = null;
        if (freelancer != null) {
            user = freelancer.getUser();
            if (user == null && freelancer.getEmail() != null && !freelancer.getEmail().isBlank()) {
                user = userRepository.findByEmailIgnoreCase(freelancer.getEmail().trim()).orElse(null);
            }
        } else {
            user = userRepository.findById(id).orElse(null);
            if (user == null && request.getEmail() != null && !request.getEmail().isBlank()) {
                user = userRepository.findByEmailIgnoreCase(request.getEmail().trim()).orElse(null);
            }
            if (user != null) {
                final Long uId = user.getId();
                final String uEmail = user.getEmail();
                freelancer = freelancerRepository.findByUserId(uId).orElse(null);
                if (freelancer == null && uEmail != null && !uEmail.isBlank()) {
                    freelancer = freelancerRepository.findByEmailIgnoreCase(uEmail.trim()).orElse(null);
                }
            }
        }

        if (freelancer == null && user == null) {
            throw new ResourceNotFoundException("Freelancer/User", "id", id);
        }

        if (freelancer != null) {
            if (targetName != null && !targetName.isBlank()) {
                freelancer.setName(targetName);
            }
            if (request.getEmail() != null && !request.getEmail().isBlank()) {
                freelancer.setEmail(request.getEmail().trim().toLowerCase());
            }
            if (request.getPhone() != null) freelancer.setPhone(request.getPhone());
            if (request.getTitle() != null) freelancer.setTitle(request.getTitle());
            if (request.getSkills() != null) freelancer.setSkills(request.getSkills());
            if (request.getBio() != null) freelancer.setBio(request.getBio());
            if (request.getExperienceYears() != null) freelancer.setExperienceYears(request.getExperienceYears());
            if (request.getHourlyRate() != null) freelancer.setHourlyRate(request.getHourlyRate());
            if (request.getAvailabilityStatus() != null) freelancer.setAvailabilityStatus(request.getAvailabilityStatus());
            if (request.getStatus() != null) {
                freelancer.setStatus(request.getStatus());
                boolean makeActive = "Approved".equalsIgnoreCase(request.getStatus()) || "Active".equalsIgnoreCase(request.getStatus());
                if (user != null) {
                    user.setActive(makeActive);
                    user = userRepository.save(user);
                }
            }
            if (request.getPartnerCompanyId() != null) freelancer.setPartnerCompanyId(request.getPartnerCompanyId());

            freelancer = freelancerRepository.save(freelancer);
        }

        if (user != null) {
            if (targetName != null && !targetName.isBlank()) {
                user.setFullName(targetName);
            }
            if (request.getEmail() != null && !request.getEmail().isBlank()) {
                user.setEmail(request.getEmail().trim().toLowerCase());
            }
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            user = userRepository.save(user);

            ProfessionalProfile prof = user.getProfessionalProfile();
            if (prof == null) {
                prof = professionalProfileRepository.findByUserId(user.getId()).orElse(null);
            }
            if (prof != null) {
                if (request.getTitle() != null) prof.setTitle(request.getTitle());
                if (request.getSkills() != null) prof.setSkills(request.getSkills());
                if (request.getBio() != null) prof.setBio(request.getBio());
                if (request.getExperienceYears() != null) prof.setExperienceYears(request.getExperienceYears());
                if (request.getHourlyRate() != null) prof.setHourlyRate(request.getHourlyRate());
                if (request.getAvailabilityStatus() != null) prof.setAvailabilityStatus(request.getAvailabilityStatus());
                professionalProfileRepository.save(prof);
            }
        }

        if (freelancer != null && user != null && freelancer.getUser() == null) {
            freelancer.setUser(user);
            freelancer = freelancerRepository.save(freelancer);
        }

        return freelancer != null ? mapToDto(freelancer) : mapUserToDto(user);
    }

    @Transactional
    public FreelancerDto approveFreelancer(Long id) {
        Freelancer freelancer = freelancerRepository.findById(id)
                .or(() -> freelancerRepository.findByUserId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer", "id", id));

        freelancer.setStatus("Approved");
        freelancer = freelancerRepository.save(freelancer);

        User user = freelancer.getUser();
        if (user == null && freelancer.getEmail() != null) {
            user = userRepository.findByEmailIgnoreCase(freelancer.getEmail().trim()).orElse(null);
        }
        if (user != null) {
            user.setActive(true);
            userRepository.save(user);
        }

        log.info("Admin approved freelancer: id={}, email={}", freelancer.getId(), freelancer.getEmail());
        return mapToDto(freelancer);
    }

    @Transactional
    public FreelancerDto rejectFreelancer(Long id, String reason) {
        Freelancer freelancer = freelancerRepository.findById(id)
                .or(() -> freelancerRepository.findByUserId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer", "id", id));

        freelancer.setStatus("Rejected");
        freelancer = freelancerRepository.save(freelancer);

        User user = freelancer.getUser();
        if (user == null && freelancer.getEmail() != null) {
            user = userRepository.findByEmailIgnoreCase(freelancer.getEmail().trim()).orElse(null);
        }
        if (user != null) {
            user.setActive(false);
            userRepository.save(user);
        }

        log.info("Admin rejected freelancer: id={}, email={}, reason={}", freelancer.getId(), freelancer.getEmail(), reason);
        return mapToDto(freelancer);
    }

    public FreelancerDto mapToDto(Freelancer freelancer) {
        if (freelancer == null) return null;
        User user = freelancer.getUser();
        if (user == null && freelancer.getEmail() != null && !freelancer.getEmail().isBlank()) {
            user = userRepository.findByEmailIgnoreCase(freelancer.getEmail().trim()).orElse(null);
        }

        Long userId = user != null ? user.getId() : freelancer.getId();
        String name = freelancer.getName() != null && !freelancer.getName().isBlank()
                ? freelancer.getName()
                : (user != null && user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : "Freelancer");
        String email = freelancer.getEmail() != null && !freelancer.getEmail().isBlank() ? freelancer.getEmail() : (user != null ? user.getEmail() : "");
        String phone = freelancer.getPhone() != null && !freelancer.getPhone().isBlank() ? freelancer.getPhone() : (user != null ? user.getPhone() : "");

        Long partnerCompanyId = null;
        String partnerCompanyName = null;
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
            }
        }

        boolean isPartnerEmployee = partnerCompanyId != null && partnerCompanyName != null && !partnerCompanyName.isBlank();
        String roleType = isPartnerEmployee ? "Professional" : "Freelancer";
        String professionalType = isPartnerEmployee ? "PARTNER_EMPLOYEE" : "FREELANCER";
        String source = isPartnerEmployee ? "Partner Company" : "Freelancer";

        String rawStatus = freelancer.getStatus() != null ? freelancer.getStatus().trim() : (isPartnerEmployee ? "Active" : "Pending Review");
        boolean isApproved = "Approved".equalsIgnoreCase(rawStatus) || "Active".equalsIgnoreCase(rawStatus);
        boolean isRejected = "Rejected".equalsIgnoreCase(rawStatus);

        String approvalStatus = isRejected ? "Rejected" : (isApproved ? "Approved" : "Pending Review");
        String verificationStatus = isRejected ? "Rejected" : (isApproved ? "Approved" : "Pending");
        String accountStatus = isRejected ? "Rejected" : (isApproved ? "Active" : "Pending Review");

        FreelancerDto dto = FreelancerDto.builder()
                .id(freelancer.getId())
                .userId(userId)
                .name(name)
                .email(email)
                .phone(phone)
                .title(freelancer.getTitle() != null ? freelancer.getTitle() : "Software Professional")
                .skills(freelancer.getSkills() != null ? freelancer.getSkills() : "")
                .bio(freelancer.getBio() != null ? freelancer.getBio() : "")
                .experienceYears(freelancer.getExperienceYears() != null ? freelancer.getExperienceYears() : 3)
                .hourlyRate(freelancer.getHourlyRate() != null ? freelancer.getHourlyRate() : new java.math.BigDecimal("50.00"))
                .availabilityStatus(freelancer.getAvailabilityStatus() != null ? freelancer.getAvailabilityStatus() : "Available")
                .status(rawStatus)
                .roleType(roleType)
                .professionalType(professionalType)
                .source(source)
                .partnerCompanyId(partnerCompanyId)
                .partnerCompany(partnerCompanyName)
                .partnerName(partnerCompanyName)
                .partnerCompanyName(partnerCompanyName)
                .approvalStatus(approvalStatus)
                .verificationStatus(verificationStatus)
                .accountStatus(accountStatus)
                .createdAt(freelancer.getCreatedAt())
                .build();

        enrichWithActiveAllocation(dto, userId);
        return dto;
    }

    public FreelancerDto mapUserToDto(User user) {
        if (user == null) return null;

        Role role = user.getRole();
        if (role == Role.ROLE_ADMIN || role == Role.ROLE_CLIENT || role == Role.ROLE_MANAGER) {
            return null;
        }

        Freelancer existing = freelancerRepository.findByUserId(user.getId()).orElse(null);
        if (existing != null) {
            return mapToDto(existing);
        }

        ProfessionalProfile prof = user.getProfessionalProfile();
        FreelancerDto dto = FreelancerDto.builder()
                .id(user.getId())
                .userId(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .title(prof != null && prof.getTitle() != null ? prof.getTitle() : "Software Professional")
                .skills(prof != null && prof.getSkills() != null ? prof.getSkills() : "")
                .bio(prof != null && prof.getBio() != null ? prof.getBio() : "")
                .experienceYears(prof != null && prof.getExperienceYears() != null ? prof.getExperienceYears() : 3)
                .hourlyRate(prof != null && prof.getHourlyRate() != null ? prof.getHourlyRate() : new java.math.BigDecimal("50.00"))
                .availabilityStatus(prof != null && prof.getAvailabilityStatus() != null ? prof.getAvailabilityStatus() : "Available")
                .status(Boolean.TRUE.equals(user.getActive()) ? "Active" : "Inactive")
                .roleType("Freelancer")
                .professionalType("FREELANCER")
                .source("Freelancer")
                .approvalStatus("Approved")
                .verificationStatus("Approved")
                .accountStatus("Active")
                .createdAt(user.getCreatedAt())
                .build();

        enrichWithActiveAllocation(dto, user.getId());
        return dto;
    }

    private void enrichWithActiveAllocation(FreelancerDto dto, Long targetUserId) {
        if (dto == null || targetUserId == null) return;

        try {
            List<WorkforceAllocation> allocations = workforceAllocationRepository.findByProfessionalId(targetUserId);
            WorkforceAllocation activeAlloc = (allocations != null ? allocations : new java.util.ArrayList<WorkforceAllocation>())
                    .stream()
                    .filter(a -> a != null && a.getProject() != null &&
                            a.getStatus() != AllocationStatus.REJECTED &&
                            a.getStatus() != AllocationStatus.DECLINED &&
                            a.getStatus() != AllocationStatus.CANCELLED &&
                            a.getStatus() != AllocationStatus.DECLINED_BY_CANDIDATE &&
                            a.getProject().getStatus() != ProjectStatus.REJECTED &&
                            a.getProject().getStatus() != ProjectStatus.DECLINED &&
                            a.getProject().getStatus() != ProjectStatus.CANCELLED &&
                            a.getProject().getStatus() != ProjectStatus.COMPLETED)
                    .findFirst()
                    .orElse(null);

            if (activeAlloc != null && activeAlloc.getProject() != null) {
                Project p = activeAlloc.getProject();
                User clientUser = p.getClient();
                String clientName = "";
                if (clientUser != null) {
                    Client clientEntity = clientRepository.findByUserId(clientUser.getId()).orElse(null);
                    if (clientEntity != null && clientEntity.getCompanyName() != null && !clientEntity.getCompanyName().isBlank()) {
                        clientName = clientEntity.getCompanyName();
                    } else if (clientUser.getFullName() != null && !clientUser.getFullName().isBlank()) {
                        clientName = clientUser.getFullName();
                    }
                }

                String projTitle = p.getTitle() != null && !p.getTitle().isBlank() ? p.getTitle() : p.getDescription();

                dto.setIsCurrentlyWorking(true);
                dto.setCurrentProjectId(p.getId());
                dto.setCurrentProjectName(projTitle);
                dto.setCurrentProject(projTitle);
                dto.setCurrentProjectClient(clientName);
                dto.setCurrentProjectRole(activeAlloc.getRoleInProject() != null ? activeAlloc.getRoleInProject() : dto.getTitle());
                dto.setCurrentAssignmentStatus(activeAlloc.getStatus() != null ? activeAlloc.getStatus().name() : "ACTIVE");
                dto.setCurrentProjectStatus(p.getStatus() != null ? p.getStatus().name() : "IN_PROGRESS");
                dto.setAvailabilityStatus("Working");
            } else {
                dto.setIsCurrentlyWorking(false);
                if (dto.getCurrentProject() == null) {
                    dto.setCurrentProject("None");
                }
            }
        } catch (Exception ex) {
            // Silently fallback if allocation lookup fails
        }
    }
}
