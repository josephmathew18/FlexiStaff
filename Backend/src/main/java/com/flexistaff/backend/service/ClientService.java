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
                ClientProfile profile = user.getClientProfile();
                ClientProjectStats stats = getProjectStats(user.getId(), null);

                String companyName = profile != null && profile.getCompanyName() != null && !profile.getCompanyName().isBlank()
                        ? profile.getCompanyName()
                        : user.getFullName();

                String industry = profile != null && profile.getIndustry() != null && !profile.getIndustry().isBlank()
                        ? profile.getIndustry()
                        : "Enterprise Software & Services";

                String tier = profile != null && profile.getTier() != null && !profile.getTier().isBlank()
                        ? profile.getTier()
                        : "Enterprise Client";

                String location = profile != null && profile.getLocation() != null && !profile.getLocation().isBlank()
                        ? profile.getLocation()
                        : "India";

                list.add(ClientDto.builder()
                        .id(user.getId())
                        .userId(user.getId())
                        .name(user.getFullName())
                        .companyName(companyName)
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .contactPhone(user.getPhone())
                        .industry(industry)
                        .tier(tier)
                        .location(location)
                        .status(user.getActive() != null && user.getActive() ? "Active" : "Inactive")
                        .activeProjects(stats.getActiveProjects())
                        .totalSpent(stats.getTotalSpent())
                        .createdAt(user.getCreatedAt())
                        .build());
            }
        }

        return list;
    }

    public ClientDto getClientById(Long id) {
        User user = userRepository.findById(id).orElse(null);
        Client client = clientRepository.findById(id).orElse(null);
        if (client == null && user != null) {
            client = clientRepository.findByUserId(user.getId()).orElse(null);
        }

        if (client != null) {
            return mapToDto(client);
        }

        if (user == null) {
            throw new ResourceNotFoundException("Client", "id", id);
        }

        ClientProfile profile = user.getClientProfile();
        ClientProjectStats stats = getProjectStats(user.getId(), null);

        String companyName = profile != null && profile.getCompanyName() != null && !profile.getCompanyName().isBlank()
                ? profile.getCompanyName()
                : user.getFullName();

        return ClientDto.builder()
                .id(user.getId())
                .userId(user.getId())
                .name(user.getFullName())
                .companyName(companyName)
                .email(user.getEmail())
                .phone(user.getPhone())
                .contactPhone(user.getPhone())
                .industry(profile != null && profile.getIndustry() != null ? profile.getIndustry() : "Enterprise Software & Services")
                .tier(profile != null && profile.getTier() != null ? profile.getTier() : "Enterprise Client")
                .location(profile != null && profile.getLocation() != null ? profile.getLocation() : "India")
                .status(user.getActive() != null && user.getActive() ? "Active" : "Inactive")
                .activeProjects(stats.getActiveProjects())
                .totalSpent(stats.getTotalSpent())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteClient(Long id) {
        User user = userRepository.findById(id).orElse(null);
        Client client = clientRepository.findById(id).orElse(null);
        if (client == null && user != null) {
            client = clientRepository.findByUserId(user.getId()).orElse(null);
        }
        if (user == null && client != null && client.getUser() != null) {
            user = client.getUser();
        }

        if (client != null) {
            clientRepository.delete(client);
        }
        if (user != null) {
            clientProfileRepository.findByUserId(user.getId()).ifPresent(clientProfileRepository::delete);
            try {
                List<com.flexistaff.backend.entity.Project> projects = projectRepository.findByClientId(user.getId());
                projectRepository.deleteAll(projects);
            } catch (Exception ignored) {}
            userRepository.delete(user);
        }
    }

    public ClientDto mapToDto(Client client) {
        Long primaryUserId = client.getUser() != null ? client.getUser().getId() : client.getId();
        User user = client.getUser();
        if (user == null && primaryUserId != null) {
            user = userRepository.findById(primaryUserId).orElse(null);
        }
        ClientProfile profile = user != null ? user.getClientProfile() : null;

        ClientProjectStats stats = getProjectStats(primaryUserId, client.getId());

        String contactName = user != null && user.getFullName() != null && !user.getFullName().isBlank()
                ? user.getFullName()
                : (client.getName() != null && !client.getName().isBlank() ? client.getName() : "N/A");

        String companyName = client.getCompanyName() != null && !client.getCompanyName().isBlank()
                ? client.getCompanyName()
                : (profile != null && profile.getCompanyName() != null && !profile.getCompanyName().isBlank() ? profile.getCompanyName() : contactName);

        String email = user != null && user.getEmail() != null ? user.getEmail() : client.getEmail();
        String phone = user != null && user.getPhone() != null ? user.getPhone() : (client.getPhone() != null ? client.getPhone() : (profile != null ? profile.getContactPhone() : null));

        String industry = client.getIndustry() != null && !client.getIndustry().isBlank()
                ? client.getIndustry()
                : (profile != null && profile.getIndustry() != null ? profile.getIndustry() : "Enterprise Software & Services");

        String tier = client.getTier() != null && !client.getTier().isBlank()
                ? client.getTier()
                : (profile != null && profile.getTier() != null ? profile.getTier() : "Enterprise Client");

        String location = client.getLocation() != null && !client.getLocation().isBlank()
                ? client.getLocation()
                : (profile != null && profile.getLocation() != null ? profile.getLocation() : "India");

        String status = client.getStatus() != null && !client.getStatus().isBlank()
                ? client.getStatus()
                : (user != null && user.getActive() != null && !user.getActive() ? "Inactive" : "Active");

        return ClientDto.builder()
                .id(primaryUserId)
                .userId(primaryUserId)
                .name(contactName)
                .companyName(companyName)
                .email(email)
                .phone(phone)
                .contactPhone(phone)
                .industry(industry)
                .tier(tier)
                .location(location)
                .status(status)
                .activeProjects(stats.getActiveProjects())
                .totalSpent(stats.getTotalSpent())
                .createdAt(client.getCreatedAt() != null ? client.getCreatedAt() : (user != null ? user.getCreatedAt() : null))
                .build();
    }

    private ClientProjectStats getProjectStats(Long primaryUserId, Long clientId) {
        int count = 0;
        java.math.BigDecimal totalSpendSum = java.math.BigDecimal.ZERO;
        try {
            java.util.Set<Long> foundProjectIds = new java.util.HashSet<>();
            List<com.flexistaff.backend.entity.Project> projects = new java.util.ArrayList<>();
            if (primaryUserId != null) {
                projects.addAll(projectRepository.findByClientId(primaryUserId));
            }
            if (clientId != null && !clientId.equals(primaryUserId)) {
                projects.addAll(projectRepository.findByClientId(clientId));
            }
            for (com.flexistaff.backend.entity.Project p : projects) {
                if (p != null && foundProjectIds.add(p.getId())) {
                    if (p.getBudget() != null) {
                        totalSpendSum = totalSpendSum.add(p.getBudget());
                    }
                }
            }
            count = foundProjectIds.size();
        } catch (Exception ignored) {}

        String formattedSpend = totalSpendSum.compareTo(java.math.BigDecimal.ZERO) > 0
                ? "₹" + String.format("%,d", totalSpendSum.longValue())
                : "₹0";

        return new ClientProjectStats(count, formattedSpend);
    }

    @lombok.Value
    private static class ClientProjectStats {
        int activeProjects;
        String totalSpent;
    }
}
