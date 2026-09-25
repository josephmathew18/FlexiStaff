package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.LoginRequest;
import com.flexistaff.backend.dto.request.RegisterRequest;
import com.flexistaff.backend.dto.response.AuthResponse;
import com.flexistaff.backend.dto.response.UserDto;
import com.flexistaff.backend.entity.Client;
import com.flexistaff.backend.entity.ClientProfile;
import com.flexistaff.backend.entity.Freelancer;
import com.flexistaff.backend.entity.ProfessionalProfile;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.exception.BadRequestException;
import com.flexistaff.backend.repository.ClientProfileRepository;
import com.flexistaff.backend.repository.ClientRepository;
import com.flexistaff.backend.repository.FreelancerRepository;
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
    private final ClientRepository clientRepository;
    private final FreelancerRepository freelancerRepository;
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
        String email = registerRequest.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email) || clientRepository.existsByEmail(email) || freelancerRepository.existsByEmail(email)) {
            throw new BadRequestException("Email address already registered: " + email);
        }

        User user = User.builder()
                .fullName(registerRequest.getFullName())
                .email(email)
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .phone(registerRequest.getPhone())
                .role(registerRequest.getRole())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // Create initial role profile and entities
        if (registerRequest.getRole() == Role.ROLE_PROFESSIONAL) {
            ProfessionalProfile profile = ProfessionalProfile.builder()
                    .user(savedUser)
                    .title(registerRequest.getTitle() != null ? registerRequest.getTitle() : "Software Professional")
                    .skills(registerRequest.getSkills())
                    .availabilityStatus("Available")
                    .build();
            professionalProfileRepository.save(profile);

            Freelancer freelancer = Freelancer.builder()
                    .user(savedUser)
                    .name(savedUser.getFullName())
                    .email(savedUser.getEmail())
                    .phone(savedUser.getPhone())
                    .password(savedUser.getPassword())
                    .title(registerRequest.getTitle() != null ? registerRequest.getTitle() : "Software Professional")
                    .skills(registerRequest.getSkills())
                    .availabilityStatus("Available")
                    .status("Active")
                    .build();
            freelancerRepository.save(freelancer);
        } else if (registerRequest.getRole() == Role.ROLE_CLIENT) {
            ClientProfile profile = ClientProfile.builder()
                    .user(savedUser)
                    .companyName(registerRequest.getCompanyName() != null ? registerRequest.getCompanyName() : "Enterprise Client")
                    .contactPhone(registerRequest.getPhone())
                    .tier("Standard")
                    .build();
            clientProfileRepository.save(profile);

            Client client = Client.builder()
                    .user(savedUser)
                    .name(savedUser.getFullName())
                    .companyName(registerRequest.getCompanyName() != null ? registerRequest.getCompanyName() : "Enterprise Client")
                    .email(savedUser.getEmail())
                    .phone(savedUser.getPhone())
                    .password(savedUser.getPassword())
                    .industry("Enterprise Software & Services")
                    .tier("Enterprise Client")
                    .location("India")
                    .status("Active")
                    .build();
            clientRepository.save(client);
        }

        return userService.mapToUserDto(savedUser);
    }
}

