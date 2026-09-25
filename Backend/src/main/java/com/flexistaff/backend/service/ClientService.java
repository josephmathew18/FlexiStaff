package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.ClientRegistrationRequest;
import com.flexistaff.backend.dto.response.ClientDto;
import com.flexistaff.backend.entity.Client;
import com.flexistaff.backend.entity.ClientProfile;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.exception.BadRequestException;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.repository.ClientProfileRepository;
import com.flexistaff.backend.repository.ClientRepository;
import com.flexistaff.backend.repository.FreelancerRepository;
import com.flexistaff.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ClientProfileRepository clientProfileRepository;
    private final FreelancerRepository freelancerRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ClientDto registerClient(ClientRegistrationRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email) || clientRepository.existsByEmail(email) || freelancerRepository.existsByEmail(email)) {
            throw new BadRequestException("Email address already registered: " + email);
        }

        // 1. Create and save central User entity (PostgreSQL generates unique auto-increment ID)
        User user = User.builder()
                .fullName(request.getFullName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.ROLE_CLIENT)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // 2. Create and save Client entity in "clients" table
        Client client = Client.builder()
                .user(savedUser)
                .name(request.getFullName())
                .companyName(request.getCompanyName())
                .email(email)
                .phone(request.getPhone())
                .password(savedUser.getPassword())
                .industry(request.getIndustry() != null ? request.getIndustry() : "Enterprise Software & Services")
                .tier(request.getTier() != null ? request.getTier() : "Enterprise Client")
                .location(request.getLocation() != null ? request.getLocation() : "India")
                .status("Active")
                .build();

        Client savedClient = clientRepository.save(client);

        // 3. Also save ClientProfile entity for full backward compatibility
        ClientProfile profile = ClientProfile.builder()
                .user(savedUser)
                .companyName(request.getCompanyName())
                .industry(request.getIndustry())
                .tier(request.getTier())
                .location(request.getLocation())
                .contactPhone(request.getPhone())
                .build();
        clientProfileRepository.save(profile);

        return mapToDto(savedClient);
    }

    public List<ClientDto> getAllClients() {
        return clientRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ClientDto getClientById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", id));
        return mapToDto(client);
    }

    @Transactional
    public void deleteClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", id));
        clientRepository.delete(client);
        if (client.getUser() != null) {
            userRepository.delete(client.getUser());
        }
    }

    public ClientDto mapToDto(Client client) {
        return ClientDto.builder()
                .id(client.getId())
                .userId(client.getUser() != null ? client.getUser().getId() : client.getId())
                .name(client.getName())
                .companyName(client.getCompanyName())
                .email(client.getEmail())
                .phone(client.getPhone())
                .contactPhone(client.getPhone())
                .industry(client.getIndustry())
                .tier(client.getTier())
                .location(client.getLocation())
                .status(client.getStatus())
                .createdAt(client.getCreatedAt())
                .build();
    }
}
