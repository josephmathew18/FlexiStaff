package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.CreateManagerRequest;
import com.flexistaff.backend.dto.request.UpdateManagerRequest;
import com.flexistaff.backend.dto.response.ManagerDto;
import com.flexistaff.backend.entity.HrManager;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.exception.BadRequestException;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.repository.HrManagerRepository;
import com.flexistaff.backend.repository.ProjectRepository;
import com.flexistaff.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ManagerService {

    private final UserRepository userRepository;
    private final HrManagerRepository hrManagerRepository;
    private final ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ManagerDto createManager(CreateManagerRequest request) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (cleanEmail.isBlank()) {
            throw new BadRequestException("Manager email cannot be blank");
        }

        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("A user with this email address already exists: " + cleanEmail);
        }

        if (hrManagerRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("An HR Manager with this email address already exists: " + cleanEmail);
        }

        String rawPassword = request.getPassword();
        if (rawPassword == null || rawPassword.isBlank()) {
            rawPassword = request.getTempPassword();
        }
        if (rawPassword == null || rawPassword.isBlank()) {
            rawPassword = "manager123";
        }

        String statusStr = request.getStatus();
        if (statusStr == null || statusStr.isBlank()) {
            statusStr = request.getAccountStatus();
        }
        if (statusStr == null || statusStr.isBlank()) {
            statusStr = "Active";
        }

        // 1. Create real User in PostgreSQL with ROLE_MANAGER
        User user = User.builder()
                .fullName(request.getName().trim())
                .email(cleanEmail)
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .password(passwordEncoder.encode(rawPassword.trim()))
                .role(Role.ROLE_MANAGER)
                .active(!"Terminated".equalsIgnoreCase(statusStr) && !"Inactive".equalsIgnoreCase(statusStr))
                .avatarUrl(request.getAvatar())
                .build();

        User savedUser = userRepository.save(user);
        log.info("Created real HR Manager User in PostgreSQL with id={}", savedUser.getId());

        // 2. Automatically generate employeeId from PostgreSQL User ID
        String empId = String.valueOf(savedUser.getId());

        // 3. Create real HrManager profile linked via foreign key user_id
        HrManager hrManager = HrManager.builder()
                .user(savedUser)
                .employeeId(empId.trim())
                .name(request.getName().trim())
                .email(cleanEmail)
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .jobTitle(request.getJobTitle() != null ? request.getJobTitle().trim() : "HR Manager")
                .department(request.getDepartment() != null ? request.getDepartment().trim() : "Enterprise Workforce Operations")
                .experience(request.getExperience() != null ? request.getExperience().trim() : "8+ Years")
                .bio(request.getBio())
                .dob(request.getDob())
                .address(request.getAddress())
                .avatar(request.getAvatar())
                .status(statusStr.trim())
                .joinDate(request.getJoinDate())
                .build();

        HrManager savedProfile = hrManagerRepository.save(hrManager);
        log.info("Created real HrManager profile in PostgreSQL with id={} for user_id={}", savedProfile.getId(), savedUser.getId());

        return mapToDto(savedProfile, savedUser);
    }

    @Transactional(readOnly = true)
    public List<ManagerDto> getAllManagers() {
        List<HrManager> profiles = hrManagerRepository.findAll();
        Map<Long, HrManager> profileByUserId = new HashMap<>();
        for (HrManager p : profiles) {
            if (p.getUser() != null) {
                profileByUserId.put(p.getUser().getId(), p);
            }
        }

        List<ManagerDto> results = new ArrayList<>();
        Set<Long> processedUserIds = new HashSet<>();

        // Add all existing HrManager profiles
        for (HrManager profile : profiles) {
            User u = profile.getUser();
            if (u != null) {
                processedUserIds.add(u.getId());
                results.add(mapToDto(profile, u));
            }
        }

        // Also include any users with ROLE_MANAGER who might not have an HrManager entity yet
        List<User> managerUsers = userRepository.findByRole(Role.ROLE_MANAGER);
        for (User u : managerUsers) {
            if (!processedUserIds.contains(u.getId())) {
                results.add(mapToDto(null, u));
            }
        }

        return results;
    }

    @Transactional(readOnly = true)
    public ManagerDto getManagerById(Long id) {
        if (id == null) {
            throw new BadRequestException("Manager ID cannot be null");
        }

        // Try find by userId
        Optional<HrManager> profileOpt = hrManagerRepository.findByUserId(id);
        if (profileOpt.isPresent()) {
            return mapToDto(profileOpt.get(), profileOpt.get().getUser());
        }

        // Try find by HrManager id
        profileOpt = hrManagerRepository.findById(id);
        if (profileOpt.isPresent()) {
            return mapToDto(profileOpt.get(), profileOpt.get().getUser());
        }

        // Try find by User id
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manager", "id", id));
        if (user.getRole() != Role.ROLE_MANAGER && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResourceNotFoundException("Manager", "id", id);
        }

        return mapToDto(null, user);
    }

    @Transactional
    public ManagerDto updateManager(Long id, UpdateManagerRequest request) {
        HrManager profile = hrManagerRepository.findByUserId(id)
                .orElseGet(() -> hrManagerRepository.findById(id).orElse(null));

        User user = null;
        if (profile != null) {
            user = profile.getUser();
        } else {
            user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Manager", "id", id));
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            if (user != null) user.setFullName(request.getName().trim());
            if (profile != null) profile.setName(request.getName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (user != null && !newEmail.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmailIgnoreCase(newEmail)) {
                    throw new BadRequestException("Email is already taken: " + newEmail);
                }
                user.setEmail(newEmail);
            }
            if (profile != null) profile.setEmail(newEmail);
        }

        if (request.getPhone() != null) {
            if (user != null) user.setPhone(request.getPhone().trim());
            if (profile != null) profile.setPhone(request.getPhone().trim());
        }

        if (request.getAvatar() != null) {
            if (user != null) user.setAvatarUrl(request.getAvatar());
            if (profile != null) profile.setAvatar(request.getAvatar());
        }

        if (profile != null) {
            if (request.getJobTitle() != null) profile.setJobTitle(request.getJobTitle().trim());
            if (request.getDepartment() != null) profile.setDepartment(request.getDepartment().trim());
            if (request.getExperience() != null) profile.setExperience(request.getExperience().trim());
            if (request.getBio() != null) profile.setBio(request.getBio());
            if (request.getStatus() != null) profile.setStatus(request.getStatus().trim());
            hrManagerRepository.save(profile);
        }

        if (user != null) {
            userRepository.save(user);
        }

        return mapToDto(profile, user);
    }

    @Transactional
    public ManagerDto updateManagerStatus(Long id, String status, String reason) {
        if (status == null || status.isBlank()) {
            throw new BadRequestException("Status cannot be blank");
        }

        HrManager profile = hrManagerRepository.findByUserId(id)
                .orElseGet(() -> hrManagerRepository.findById(id).orElse(null));

        User user = null;
        if (profile != null) {
            user = profile.getUser();
            profile.setStatus(status.trim());
            hrManagerRepository.save(profile);
        } else {
            user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Manager", "id", id));
        }

        if (user != null) {
            boolean isActive = !"Terminated".equalsIgnoreCase(status) && !"Inactive".equalsIgnoreCase(status);
            user.setActive(isActive);
            userRepository.save(user);
        }

        log.info("Updated HR Manager status to {} for id={}", status, id);
        return mapToDto(profile, user);
    }

    @Transactional
    public void deleteManager(Long id) {
        HrManager profile = hrManagerRepository.findByUserId(id)
                .orElseGet(() -> hrManagerRepository.findById(id).orElse(null));

        if (profile != null) {
            User u = profile.getUser();
            hrManagerRepository.delete(profile);
            if (u != null) {
                userRepository.delete(u);
            }
        } else {
            User u = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Manager", "id", id));
            userRepository.delete(u);
        }
    }

    private ManagerDto mapToDto(HrManager profile, User user) {
        Long primaryId = user != null ? user.getId() : (profile != null ? profile.getId() : null);
        Long profileId = profile != null ? profile.getId() : null;
        Long userId = user != null ? user.getId() : (profile != null && profile.getUser() != null ? profile.getUser().getId() : null);

        String name = profile != null && profile.getName() != null ? profile.getName()
                : (user != null ? user.getFullName() : "");
        String email = profile != null && profile.getEmail() != null ? profile.getEmail()
                : (user != null ? user.getEmail() : "");
        String phone = profile != null && profile.getPhone() != null ? profile.getPhone()
                : (user != null ? user.getPhone() : "");
        String avatar = profile != null && profile.getAvatar() != null ? profile.getAvatar()
                : (user != null ? user.getAvatarUrl() : "");
        String employeeId = profile != null && profile.getEmployeeId() != null ? profile.getEmployeeId()
                : (primaryId != null ? String.valueOf(primaryId) : "");
        String jobTitle = profile != null && profile.getJobTitle() != null ? profile.getJobTitle()
                : "HR Manager";
        String department = profile != null && profile.getDepartment() != null ? profile.getDepartment()
                : "Enterprise Workforce Operations";
        String experience = profile != null && profile.getExperience() != null ? profile.getExperience()
                : "8+ Years";
        String status = profile != null && profile.getStatus() != null ? profile.getStatus()
                : (user != null && Boolean.FALSE.equals(user.getActive()) ? "Inactive" : "Active");

        int assignedProjectsCount = 0;
        if (userId != null) {
            try {
                assignedProjectsCount = projectRepository.findByManagerId(userId).size();
            } catch (Exception ignored) { }
        }

        return ManagerDto.builder()
                .id(primaryId)
                .profileId(profileId)
                .userId(userId)
                .employeeId(employeeId)
                .name(name)
                .email(email)
                .phone(phone)
                .role("ROLE_MANAGER")
                .jobTitle(jobTitle)
                .department(department)
                .experience(experience)
                .bio(profile != null ? profile.getBio() : "")
                .dob(profile != null ? profile.getDob() : "")
                .address(profile != null ? profile.getAddress() : "")
                .avatar(avatar)
                .status(status)
                .joinDate(profile != null ? profile.getJoinDate() : "")
                .assignedProjectsCount(assignedProjectsCount)
                .teamSize(0)
                .createdAt(profile != null ? profile.getCreatedAt() : (user != null ? user.getCreatedAt() : null))
                .updatedAt(profile != null ? profile.getUpdatedAt() : (user != null ? user.getUpdatedAt() : null))
                .build();
    }
}
