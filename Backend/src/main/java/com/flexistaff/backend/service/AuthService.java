package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.LoginRequest;
import com.flexistaff.backend.dto.request.RegisterRequest;
import com.flexistaff.backend.dto.response.AuthResponse;
import com.flexistaff.backend.dto.response.UserDto;
import com.flexistaff.backend.entity.ClientProfile;
import com.flexistaff.backend.entity.ProfessionalProfile;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.exception.BadRequestException;
import com.flexistaff.backend.repository.ClientProfileRepository;
import com.flexistaff.backend.repository.ProfessionalProfileRepository;
import com.flexistaff.backend.repository.UserRepository;
import com.flexistaff.backend.security.JwtTokenProvider;
import com.flexistaff.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final ClientProfileRepository clientProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public UserDto register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email address already registered");
        }

        User user = User.builder()
                .fullName(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .phone(registerRequest.getPhone())
                .role(registerRequest.getRole())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // Create initial role profile if applicable
        if (registerRequest.getRole() == Role.ROLE_PROFESSIONAL) {
            ProfessionalProfile profile = ProfessionalProfile.builder()
                    .user(savedUser)
                    .title(registerRequest.getTitle() != null ? registerRequest.getTitle() : "Software Professional")
                    .skills(registerRequest.getSkills())
                    .availabilityStatus("Available")
                    .build();
            professionalProfileRepository.save(profile);
        } else if (registerRequest.getRole() == Role.ROLE_CLIENT) {
            ClientProfile profile = ClientProfile.builder()
                    .user(savedUser)
                    .companyName(registerRequest.getCompanyName() != null ? registerRequest.getCompanyName() : "Enterprise Client")
                    .contactPhone(registerRequest.getPhone())
                    .tier("Standard")
                    .build();
            clientProfileRepository.save(profile);
        }

        return userService.mapToUserDto(savedUser);
    }
}
