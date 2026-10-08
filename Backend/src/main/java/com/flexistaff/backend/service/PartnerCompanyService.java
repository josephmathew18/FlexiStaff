package com.flexistaff.backend.service;

import com.flexistaff.backend.config.DatabaseSequenceRepairRunner;
import com.flexistaff.backend.dto.request.PartnerCompanyRegistrationRequest;
import com.flexistaff.backend.dto.request.UpdatePartnerCompanyRequest;
import com.flexistaff.backend.dto.response.PartnerCompanyDto;
import com.flexistaff.backend.entity.Freelancer;
import com.flexistaff.backend.entity.PartnerCompany;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.exception.BadRequestException;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.repository.FreelancerRepository;
import com.flexistaff.backend.repository.PartnerCompanyRepository;
import com.flexistaff.backend.repository.UserRepository;
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
public class PartnerCompanyService {

    private final PartnerCompanyRepository partnerCompanyRepository;
    private final UserRepository userRepository;
    private final FreelancerRepository freelancerRepository;
    private final PasswordEncoder passwordEncoder;
    private final DatabaseSequenceRepairRunner sequenceRepairRunner;

    public List<PartnerCompanyDto> getAllPartners() {
        return partnerCompanyRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PartnerCompanyDto getPartnerById(Long id) {
        PartnerCompany partner = partnerCompanyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PartnerCompany", "id", id));
        return mapToDto(partner);
    }

    @Transactional
    public PartnerCompanyDto registerPartner(PartnerCompanyRegistrationRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (partnerCompanyRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Partner company with email already registered: " + email);
        }

        String rawPassword = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword()
                : (request.getTempPassword() != null && !request.getTempPassword().isBlank()
                ? request.getTempPassword()
                : "Password123!");

        // 1. Create or retrieve User with ROLE_PARTNER
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            String contactName = request.getContactPerson() != null && !request.getContactPerson().isBlank()
                    ? request.getContactPerson()
                    : (request.getName() != null && !request.getName().isBlank() ? request.getName() : request.getCompanyName());

            user = User.builder()
                    .fullName(contactName != null ? contactName : "Partner Contact")
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .phone(request.getPhone())
                    .role(Role.ROLE_PARTNER)
                    .active(true)
                    .build();

            user = userRepository.save(user);
        }

        String companyName = request.getCompanyName() != null && !request.getCompanyName().isBlank()
                ? request.getCompanyName()
                : (request.getName() != null && !request.getName().isBlank() ? request.getName() : "Partner Organization");

        String displayName = request.getName() != null && !request.getName().isBlank()
                ? request.getName()
                : companyName;

        // 2. Create and persist PartnerCompany in PostgreSQL
        PartnerCompany partner = PartnerCompany.builder()
                .companyName(companyName)
                .name(displayName)
                .contactPerson(request.getContactPerson() != null ? request.getContactPerson() : user.getFullName())
                .email(email)
                .phone(request.getPhone() != null ? request.getPhone() : user.getPhone())
                .location(request.getLocation() != null ? request.getLocation() : "India")
                .industry(request.getIndustry() != null ? request.getIndustry() : "IT Staffing & Consulting")
                .tier(request.getTier() != null ? request.getTier() : "Strategic Partner")
                .specialties(request.getSpecialties())
                .status(request.getStatus() != null ? request.getStatus() : "Active")
                .suppliedProfessionals(request.getSuppliedProfessionals() != null ? request.getSuppliedProfessionals() : 0)
                .user(user)
                .build();

        PartnerCompany savedPartner = partnerCompanyRepository.save(partner);

        log.info("Registered Partner Company with PostgreSQL ID: {}, Company: {}", savedPartner.getId(), savedPartner.getCompanyName());
        return mapToDto(savedPartner);
    }

    @Transactional
    public PartnerCompanyDto updatePartner(Long id, UpdatePartnerCompanyRequest request) {
        PartnerCompany partner = partnerCompanyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PartnerCompany", "id", id));

        if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            partner.setCompanyName(request.getCompanyName().trim());
        }
        if (request.getName() != null && !request.getName().isBlank()) {
            partner.setName(request.getName().trim());
            if (request.getCompanyName() == null || request.getCompanyName().isBlank()) {
                partner.setCompanyName(request.getName().trim());
            }
        }
        if (request.getContactPerson() != null && !request.getContactPerson().isBlank()) {
            partner.setContactPerson(request.getContactPerson().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            partner.setEmail(request.getEmail().trim().toLowerCase());
        }
        if (request.getPhone() != null) {
            partner.setPhone(request.getPhone().trim());
        }
        if (request.getLocation() != null) {
            partner.setLocation(request.getLocation().trim());
        }
        if (request.getIndustry() != null) {
            partner.setIndustry(request.getIndustry().trim());
        }
        if (request.getTier() != null) {
            partner.setTier(request.getTier().trim());
        }
        if (request.getSpecialties() != null) {
            partner.setSpecialties(request.getSpecialties().trim());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            partner.setStatus(request.getStatus().trim());
        }
        if (request.getSuppliedProfessionals() != null) {
            partner.setSuppliedProfessionals(request.getSuppliedProfessionals());
        }

        PartnerCompany updatedPartner = partnerCompanyRepository.save(partner);
        log.info("Updated Partner Company ID: {}, New Company Name: {}", updatedPartner.getId(), updatedPartner.getCompanyName());

        // Also update linked user profile if available
        if (partner.getUser() != null) {
            User user = partner.getUser();
            if (partner.getContactPerson() != null && !partner.getContactPerson().isBlank()) {
                user.setFullName(partner.getContactPerson());
            }
            if (partner.getPhone() != null && !partner.getPhone().isBlank()) {
                user.setPhone(partner.getPhone());
            }
            userRepository.save(user);
        }

        return mapToDto(updatedPartner);
    }

    @Transactional
    public void deletePartner(Long id) {
        PartnerCompany partner = partnerCompanyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PartnerCompany", "id", id));
        partnerCompanyRepository.delete(partner);
        log.info("Deleted Partner Company ID: {}", id);
    }

    public PartnerCompanyDto mapToDto(PartnerCompany partner) {
        if (partner == null) return null;

        List<Freelancer> workforce = freelancerRepository.findByPartnerCompanyId(partner.getId());
        int workforceCount = workforce != null ? workforce.size() : 0;
        int activePlacements = (int) (workforce != null ? workforce.stream().filter(w -> "Working".equalsIgnoreCase(w.getAvailabilityStatus()) || "Active".equalsIgnoreCase(w.getStatus())).count() : 0);

        int supplied = partner.getSuppliedProfessionals() != null && partner.getSuppliedProfessionals() > workforceCount
                ? partner.getSuppliedProfessionals()
                : workforceCount;

        return PartnerCompanyDto.builder()
                .id(partner.getId())
                .numericId(partner.getId())
                .companyName(partner.getCompanyName())
                .name(partner.getName() != null ? partner.getName() : partner.getCompanyName())
                .contactPerson(partner.getContactPerson())
                .email(partner.getEmail())
                .phone(partner.getPhone())
                .location(partner.getLocation())
                .city(partner.getLocation())
                .industry(partner.getIndustry())
                .tier(partner.getTier())
                .specialties(partner.getSpecialties())
                .status(partner.getStatus())
                .suppliedProfessionals(supplied)
                .activePlacements(activePlacements)
                .availabilityRate("100%")
                .rating(4.9)
                .userId(partner.getUser() != null ? partner.getUser().getId() : null)
                .createdAt(partner.getCreatedAt())
                .updatedAt(partner.getUpdatedAt())
                .build();
    }
}
