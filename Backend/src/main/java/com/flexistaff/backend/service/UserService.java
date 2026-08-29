package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.UpdateUserProfileRequest;
import com.flexistaff.backend.dto.response.ClientDto;
import com.flexistaff.backend.dto.response.ProfessionalDto;
import com.flexistaff.backend.dto.response.UserDto;
import com.flexistaff.backend.entity.ClientProfile;
import com.flexistaff.backend.entity.ProfessionalProfile;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.repository.ClientProfileRepository;
import com.flexistaff.backend.repository.ProfessionalProfileRepository;
import com.flexistaff.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final ClientProfileRepository clientProfileRepository;

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToUserDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToUserDto(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUserProfile(Long userId, UpdateUserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        if (user.getRole() == Role.ROLE_PROFESSIONAL) {
            ProfessionalProfile profile = professionalProfileRepository.findByUserId(userId)
                    .orElseGet(() -> ProfessionalProfile.builder().user(user).build());

            if (request.getTitle() != null) profile.setTitle(request.getTitle());
            if (request.getBio() != null) profile.setBio(request.getBio());
            if (request.getSkills() != null) profile.setSkills(request.getSkills());
            if (request.getExperienceYears() != null) profile.setExperienceYears(request.getExperienceYears());
            if (request.getHourlyRate() != null) profile.setHourlyRate(request.getHourlyRate());
            if (request.getAvailabilityStatus() != null) profile.setAvailabilityStatus(request.getAvailabilityStatus());

            professionalProfileRepository.save(profile);
        } else if (user.getRole() == Role.ROLE_CLIENT) {
            ClientProfile profile = clientProfileRepository.findByUserId(userId)
                    .orElseGet(() -> ClientProfile.builder().user(user).build());

            if (request.getCompanyName() != null) profile.setCompanyName(request.getCompanyName());
            if (request.getIndustry() != null) profile.setIndustry(request.getIndustry());
            if (request.getTier() != null) profile.setTier(request.getTier());
            if (request.getLocation() != null) profile.setLocation(request.getLocation());

            clientProfileRepository.save(profile);
        }

        User updatedUser = userRepository.save(user);
        return mapToUserDto(updatedUser);
    }

    public UserDto mapToUserDto(User user) {
        UserDto dto = UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.getActive())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .build();

        if (user.getProfessionalProfile() != null) {
            ProfessionalProfile prof = user.getProfessionalProfile();
            dto.setProfessionalProfile(ProfessionalDto.builder()
                    .id(prof.getId())
                    .title(prof.getTitle())
                    .bio(prof.getBio())
                    .skills(prof.getSkills())
                    .experienceYears(prof.getExperienceYears())
                    .hourlyRate(prof.getHourlyRate())
                    .availabilityStatus(prof.getAvailabilityStatus())
                    .rating(prof.getRating())
                    .build());
        }

        if (user.getClientProfile() != null) {
            ClientProfile client = user.getClientProfile();
            dto.setClientProfile(ClientDto.builder()
                    .id(client.getId())
                    .companyName(client.getCompanyName())
                    .industry(client.getIndustry())
                    .tier(client.getTier())
                    .location(client.getLocation())
                    .contactPhone(client.getContactPhone())
                    .logoUrl(client.getLogoUrl())
                    .build());
        }

        return dto;
    }
}
