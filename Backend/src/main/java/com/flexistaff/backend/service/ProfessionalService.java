package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.response.UserDto;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfessionalService {

    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<UserDto> getAllProfessionals() {
        return userRepository.findByRole(Role.ROLE_PROFESSIONAL).stream()
                .map(userService::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAvailableProfessionals() {
        return userRepository.findByRoleAndActive(Role.ROLE_PROFESSIONAL, true).stream()
                .filter(u -> u.getProfessionalProfile() != null &&
                        "Available".equalsIgnoreCase(u.getProfessionalProfile().getAvailabilityStatus()))
                .map(userService::mapToUserDto)
                .collect(Collectors.toList());
    }
}
