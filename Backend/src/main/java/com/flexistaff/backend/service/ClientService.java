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
    private final com.flexistaff.backend.repository.ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.flexistaff.backend.config.DatabaseSequenceRepairRunner sequenceRepairRunner;

    @Transactional
    public ClientDto registerClient(ClientRegistrationRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email) || clientRepository.existsByEmailIgnoreCase(email) || freelancerRepository.existsByEmailIgnoreCase(email)) {
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

        User savedUser;
        try {
            savedUser = userRepository.save(user);
            userRepository.flush();
        } catch (Exception ex) {
            sequenceRepairRunner.repairDatabaseSequences();
            savedUser = userRepository.save(user);
            userRepository.flush();
        }

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
        List<ClientDto> list = clientRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        List<User> clientUsers = userRepository.findByRole(Role.ROLE_CLIENT);
        for (User user : clientUsers) {
            boolean alreadyMapped = list.stream().anyMatch(c -> c.getUserId() != null && c.getUserId().equals(user.getId()));
            if (!alreadyMapped) {
                int projectCount = 0;
                try {
                    projectCount = projectRepository.findByClientId(user.getId()).size();
                } catch (Exception ignored) {}

                list.add(ClientDto.builder()
                        .id(user.getId())
                        .userId(user.getId())
                        .name(user.getFullName())
                        .companyName(user.getClientProfile() != null && user.getClientProfile().getCompanyName() != null ? user.getClientProfile().getCompanyName() : user.getFullName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .contactPhone(user.getPhone())
                        .industry(user.getClientProfile() != null && user.getClientProfile().getIndustry() != null ? user.getClientProfile().getIndustry() : "Enterprise Software & Services")
                        .tier(user.getClientProfile() != null && user.getClientProfile().getTier() != null ? user.getClientProfile().getTier() : "Enterprise Client")
                        .location(user.getClientProfile() != null && user.getClientProfile().getLocation() != null ? user.getClientProfile().getLocation() : "India")
                        .status(user.getActive() != null && user.getActive() ? "Active" : "Inactive")
                        .activeProjects(projectCount)
                        .totalSpent("₹0")
                        .createdAt(user.getCreatedAt())
                        .build());
            }
        }

        return list;
    }

    public ClientDto getClientById(Long id) {
        Client client = clientRepository.findById(id).orElse(null);
        if (client != null) {
            return mapToDto(client);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", id));
        int projectCount = 0;
        try {
            projectCount = projectRepository.findByClientId(user.getId()).size();
        } catch (Exception ignored) {}

        return ClientDto.builder()
                .id(user.getId())
                .userId(user.getId())
                .name(user.getFullName())
                .companyName(user.getClientProfile() != null && user.getClientProfile().getCompanyName() != null ? user.getClientProfile().getCompanyName() : user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .contactPhone(user.getPhone())
                .industry(user.getClientProfile() != null && user.getClientProfile().getIndustry() != null ? user.getClientProfile().getIndustry() : "Enterprise Software & Services")
                .tier(user.getClientProfile() != null && user.getClientProfile().getTier() != null ? user.getClientProfile().getTier() : "Enterprise Client")
                .location(user.getClientProfile() != null && user.getClientProfile().getLocation() != null ? user.getClientProfile().getLocation() : "India")
                .status(user.getActive() != null && user.getActive() ? "Active" : "Inactive")
                .activeProjects(projectCount)
                .totalSpent("₹0")
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteClient(Long id) {
        Client client = clientRepository.findById(id).orElse(null);
        if (client != null) {
            clientRepository.delete(client);
            if (client.getUser() != null) {
                userRepository.delete(client.getUser());
            }
        } else {
            User user = userRepository.findById(id).orElse(null);
            if (user != null) {
                userRepository.delete(user);
            }
        }
    }

    public ClientDto mapToDto(Client client) {
        int projectCount = 0;
        try {
            Long searchId = client.getUser() != null ? client.getUser().getId() : client.getId();
            projectCount = projectRepository.findByClientId(searchId).size();
        } catch (Exception ignored) {}

        return ClientDto.builder()
                .id(client.getId())
                .userId(client.getUser() != null ? client.getUser().getId() : client.getId())
                .name(client.getName())
                .companyName(client.getCompanyName() != null ? client.getCompanyName() : client.getName())
                .email(client.getEmail())
                .phone(client.getPhone())
                .contactPhone(client.getPhone())
                .industry(client.getIndustry() != null ? client.getIndustry() : "Enterprise Software & Services")
                .tier(client.getTier() != null ? client.getTier() : "Enterprise Client")
                .location(client.getLocation() != null ? client.getLocation() : "India")
                .status(client.getStatus() != null ? client.getStatus() : "Active")
                .activeProjects(projectCount)
                .totalSpent("₹0")
                .createdAt(client.getCreatedAt())
                .build();
    }
}
