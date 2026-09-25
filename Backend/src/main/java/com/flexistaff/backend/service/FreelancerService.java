package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.FreelancerRegistrationRequest;
import com.flexistaff.backend.dto.response.FreelancerDto;
import com.flexistaff.backend.entity.Freelancer;
import com.flexistaff.backend.entity.ProfessionalProfile;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.exception.BadRequestException;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.repository.ClientRepository;
import com.flexistaff.backend.repository.FreelancerRepository;
import com.flexistaff.backend.repository.ProfessionalProfileRepository;
import com.flexistaff.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FreelancerService {

    private final UserRepository userRepository;
    private final FreelancerRepository freelancerRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.flexistaff.backend.config.DatabaseSequenceRepairRunner sequenceRepairRunner;

    @Transactional
    public FreelancerDto registerFreelancer(FreelancerRegistrationRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email) || freelancerRepository.existsByEmailIgnoreCase(email) || clientRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email address already registered: " + email);
        }

        // 1. Create and save central User entity (PostgreSQL generates unique auto-increment ID)
        User user = User.builder()
                .fullName(request.getFullName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.ROLE_PROFESSIONAL)
                .active(true)
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
                .status("Active")
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

    public List<FreelancerDto> getAllFreelancers() {
        return freelancerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public FreelancerDto getFreelancerById(Long id) {
        Freelancer freelancer = freelancerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer", "id", id));
        return mapToDto(freelancer);
    }

    @Transactional
    public void deleteFreelancer(Long id) {
        Freelancer freelancer = freelancerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer", "id", id));
        freelancerRepository.delete(freelancer);
        if (freelancer.getUser() != null) {
            userRepository.delete(freelancer.getUser());
        }
    }

    public FreelancerDto mapToDto(Freelancer freelancer) {
        return FreelancerDto.builder()
                .id(freelancer.getId())
                .userId(freelancer.getUser() != null ? freelancer.getUser().getId() : freelancer.getId())
                .name(freelancer.getName())
                .email(freelancer.getEmail())
                .phone(freelancer.getPhone())
                .title(freelancer.getTitle())
                .skills(freelancer.getSkills())
                .bio(freelancer.getBio())
                .experienceYears(freelancer.getExperienceYears())
                .hourlyRate(freelancer.getHourlyRate())
                .availabilityStatus(freelancer.getAvailabilityStatus())
                .status(freelancer.getStatus())
                .createdAt(freelancer.getCreatedAt())
                .build();
    }
}
