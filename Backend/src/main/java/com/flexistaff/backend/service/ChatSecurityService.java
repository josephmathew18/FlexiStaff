package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.chat.ChatContactDto;
import com.flexistaff.backend.entity.*;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatSecurityService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final WorkforceAllocationRepository workforceAllocationRepository;
    private final FreelancerRepository freelancerRepository;
    private final PartnerCompanyRepository partnerCompanyRepository;
    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public boolean canCommunicate(User currentUser, User targetUser, Long projectId) {
        if (currentUser == null || targetUser == null) return false;
        if (currentUser.getId().equals(targetUser.getId())) return false;

        Role currentRole = currentUser.getRole();
        Role targetRole = targetUser.getRole();

        // 1. Admin rules
        if (currentRole == Role.ROLE_ADMIN) {
            return targetRole == Role.ROLE_CLIENT || targetRole == Role.ROLE_MANAGER || targetRole == Role.ROLE_PARTNER || targetRole == Role.ROLE_PROFESSIONAL;
        }
        if (targetRole == Role.ROLE_ADMIN) {
            return currentRole == Role.ROLE_CLIENT || currentRole == Role.ROLE_MANAGER || currentRole == Role.ROLE_PARTNER || currentRole == Role.ROLE_PROFESSIONAL;
        }

        // 2. Client rules
        if (currentRole == Role.ROLE_CLIENT) {
            if (targetRole == Role.ROLE_MANAGER) return true;
            if (targetRole == Role.ROLE_PROFESSIONAL) {
                if (projectId != null) {
                    Project p = projectRepository.findById(projectId).orElse(null);
                    if (p != null && p.getClient() != null && p.getClient().getId().equals(currentUser.getId())) {
                        return true;
                    }
                }
                return isProfessionalAssignedToClient(targetUser.getId(), currentUser.getId());
            }
            return false;
        }
        if (targetRole == Role.ROLE_CLIENT) {
            if (currentRole == Role.ROLE_MANAGER) return true;
            if (currentRole == Role.ROLE_PROFESSIONAL) {
                if (projectId != null) {
                    Project p = projectRepository.findById(projectId).orElse(null);
                    if (p != null && p.getClient() != null && p.getClient().getId().equals(targetUser.getId())) {
                        return true;
                    }
                }
                return isProfessionalAssignedToClient(currentUser.getId(), targetUser.getId());
            }
            return false;
        }

        // 3. HR Manager rules
        if (currentRole == Role.ROLE_MANAGER) {
            return targetRole == Role.ROLE_PARTNER || targetRole == Role.ROLE_PROFESSIONAL || targetRole == Role.ROLE_CLIENT || targetRole == Role.ROLE_ADMIN;
        }
        if (targetRole == Role.ROLE_MANAGER) {
            return currentRole == Role.ROLE_PARTNER || currentRole == Role.ROLE_PROFESSIONAL || currentRole == Role.ROLE_CLIENT || currentRole == Role.ROLE_ADMIN;
        }

        // 4. Partner Company rules
        if (currentRole == Role.ROLE_PARTNER) {
            if (targetRole == Role.ROLE_MANAGER) return true;
            if (targetRole == Role.ROLE_PROFESSIONAL) {
                return isProfessionalEmployedByPartner(targetUser.getId(), currentUser.getId());
            }
            return false;
        }
        if (targetRole == Role.ROLE_PARTNER) {
            if (currentRole == Role.ROLE_MANAGER) return true;
            if (currentRole == Role.ROLE_PROFESSIONAL) {
                return isProfessionalEmployedByPartner(currentUser.getId(), targetUser.getId());
            }
            return false;
        }

        // 5. Professional rules
        if (currentRole == Role.ROLE_PROFESSIONAL && targetRole == Role.ROLE_PROFESSIONAL) {
            // Professionals do not direct message other professionals unless in same project
            if (projectId != null) {
                return areBothAssignedToProject(currentUser.getId(), targetUser.getId(), projectId);
            }
            return false;
        }

        return false;
    }

    @Transactional(readOnly = true)
    public List<ChatContactDto> getEligibleContacts(User currentUser) {
        if (currentUser == null) return Collections.emptyList();

        Map<Long, ChatContactDto> contacts = new LinkedHashMap<>();
        Role role = currentUser.getRole();

        if (role == Role.ROLE_ADMIN) {
            // Admin can contact Clients, HR Managers, Partner Companies, and Professionals
            userRepository.findByRole(Role.ROLE_CLIENT).forEach(u -> addContact(contacts, u, "Client", null, null));
            userRepository.findByRole(Role.ROLE_MANAGER).forEach(u -> addContact(contacts, u, "HR Manager", null, null));
            userRepository.findByRole(Role.ROLE_PARTNER).forEach(u -> addContact(contacts, u, "Partner Company", null, null));
            userRepository.findByRole(Role.ROLE_PROFESSIONAL).forEach(u -> addContact(contacts, u, "Professional", null, null));
        } else if (role == Role.ROLE_CLIENT) {
            // Client can contact Admins, Managers, and Assigned Professionals
            userRepository.findByRole(Role.ROLE_ADMIN).forEach(u -> addContact(contacts, u, "System Admin", "FlexiStaff Support", null));
            userRepository.findByRole(Role.ROLE_MANAGER).forEach(u -> addContact(contacts, u, "HR Manager", "Operations", null));

            // Find all assigned professionals on projects owned by this client
            List<Project> clientProjects = projectRepository.findByClientId(currentUser.getId());
            for (Project p : clientProjects) {
                List<WorkforceAllocation> allocations = workforceAllocationRepository.findByProjectId(p.getId());
                for (WorkforceAllocation wa : allocations) {
                    if (wa.getProfessional() != null) {
                        addContact(contacts, wa.getProfessional(), "Assigned Professional", p.getTitle(), p.getId());
                    }
                }
            }
        } else if (role == Role.ROLE_MANAGER) {
            // Manager can contact Clients, Partner Companies, Professionals, and Admin
            userRepository.findByRole(Role.ROLE_CLIENT).forEach(u -> addContact(contacts, u, "Client", null, null));
            userRepository.findByRole(Role.ROLE_PARTNER).forEach(u -> addContact(contacts, u, "Partner Company", null, null));
            userRepository.findByRole(Role.ROLE_PROFESSIONAL).forEach(u -> addContact(contacts, u, "Professional", null, null));
            userRepository.findByRole(Role.ROLE_ADMIN).forEach(u -> addContact(contacts, u, "System Admin", null, null));
        } else if (role == Role.ROLE_PARTNER) {
            // Partner can contact HR Managers and their own registered workforce
            userRepository.findByRole(Role.ROLE_MANAGER).forEach(u -> addContact(contacts, u, "HR Manager", "FlexiStaff", null));

            // Find partner company entity linked to current user
            Optional<PartnerCompany> pcOpt = partnerCompanyRepository.findByUserId(currentUser.getId());
            if (pcOpt.isPresent()) {
                PartnerCompany pc = pcOpt.get();
                List<Freelancer> employees = freelancerRepository.findByPartnerCompanyId(pc.getId());
                for (Freelancer f : employees) {
                    if (f.getUser() != null) {
                        addContact(contacts, f.getUser(), "Partner Employee", pc.getCompanyName(), null);
                    }
                }
            }
        } else if (role == Role.ROLE_PROFESSIONAL) {
            // 1. Prioritize assigned project stakeholders: HR Manager and Client of each assigned project
            List<WorkforceAllocation> allocations = workforceAllocationRepository.findByProfessionalId(currentUser.getId());
            for (WorkforceAllocation wa : allocations) {
                Project p = wa.getProject();
                if (p != null) {
                    if (p.getManager() != null) {
                        addContact(contacts, p.getManager(), "HR Manager", p.getTitle(), p.getId());
                    }
                    if (p.getClient() != null) {
                        addContact(contacts, p.getClient(), "Project Client", p.getTitle(), p.getId());
                    }
                }
            }

            // Also check all projects for direct allocations
            List<Project> allProjects = projectRepository.findAll();
            for (Project p : allProjects) {
                if (p.getAllocations() != null) {
                    boolean isAssigned = p.getAllocations().stream().anyMatch(
                            a -> a.getProfessional() != null && a.getProfessional().getId().equals(currentUser.getId())
                    );
                    if (isAssigned) {
                        if (p.getManager() != null) {
                            addContact(contacts, p.getManager(), "HR Manager", p.getTitle(), p.getId());
                        }
                        if (p.getClient() != null) {
                            addContact(contacts, p.getClient(), "Project Client", p.getTitle(), p.getId());
                        }
                    }
                }
            }

            // 2. Add general HR Managers for general platform support
            userRepository.findByRole(Role.ROLE_MANAGER).forEach(u -> addContact(contacts, u, "HR Manager", "FlexiStaff", null));

            // 3. Check if professional belongs to a partner company
            Optional<Freelancer> fOpt = freelancerRepository.findByUserId(currentUser.getId());
            if (fOpt.isPresent() && fOpt.get().getPartnerCompanyId() != null) {
                partnerCompanyRepository.findById(fOpt.get().getPartnerCompanyId()).ifPresent(pc -> {
                    if (pc.getUser() != null) {
                        addContact(contacts, pc.getUser(), "Partner Company", pc.getCompanyName(), null);
                    }
                });
            }
        }

        // Exclude self if somehow present
        contacts.remove(currentUser.getId());
        return new ArrayList<>(contacts.values());
    }

    private void addContact(Map<Long, ChatContactDto> contacts, User user, String roleName, String contextTitle, Long projectId) {
        if (user == null || user.getId() == null) return;
        ChatContactDto dto = contacts.get(user.getId());
        if (dto == null) {
            String company = null;
            if (user.getClientProfile() != null) company = user.getClientProfile().getCompanyName();
            else if (user.getPartnerCompany() != null) company = user.getPartnerCompany().getCompanyName();
            if (company == null) {
                Optional<Client> clientOpt = clientRepository.findByUserId(user.getId());
                if (clientOpt.isPresent() && clientOpt.get().getCompanyName() != null) {
                    company = clientOpt.get().getCompanyName();
                }
            }

            String displayName = user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : user.getEmail();
            if (company != null && !company.isBlank() && !displayName.toLowerCase().contains(company.toLowerCase())) {
                displayName = displayName + " (" + company + ")";
            }

            dto = ChatContactDto.builder()
                    .id(user.getId())
                    .fullName(displayName)
                    .email(user.getEmail())
                    .role(roleName)
                    .avatarUrl(user.getAvatarUrl())
                    .companyName(company)
                    .organization(company)
                    .projectTitle(contextTitle)
                    .projectId(projectId)
                    .online(true)
                    .build();
            contacts.put(user.getId(), dto);
        } else if (contextTitle != null && dto.getProjectTitle() == null) {
            dto.setProjectTitle(contextTitle);
            dto.setProjectId(projectId);
        }
    }

    private boolean isProfessionalAssignedToClient(Long professionalUserId, Long clientUserId) {
        List<Project> clientProjects = projectRepository.findByClientId(clientUserId);
        for (Project p : clientProjects) {
            if (workforceAllocationRepository.findByProjectIdAndProfessionalId(p.getId(), professionalUserId).isPresent()) {
                return true;
            }
            List<WorkforceAllocation> allocs = workforceAllocationRepository.findByProjectId(p.getId());
            for (WorkforceAllocation wa : allocs) {
                if (wa.getProfessional() != null && wa.getProfessional().getId().equals(professionalUserId)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean isProfessionalEmployedByPartner(Long professionalUserId, Long partnerUserId) {
        Optional<PartnerCompany> pc = partnerCompanyRepository.findByUserId(partnerUserId);
        if (pc.isEmpty()) return false;
        Optional<Freelancer> f = freelancerRepository.findByUserId(professionalUserId);
        return f.isPresent() && pc.get().getId().equals(f.get().getPartnerCompanyId());
    }

    private boolean areBothAssignedToProject(Long user1Id, Long user2Id, Long projectId) {
        return workforceAllocationRepository.findByProjectIdAndProfessionalId(projectId, user1Id).isPresent()
                && workforceAllocationRepository.findByProjectIdAndProfessionalId(projectId, user2Id).isPresent();
    }

    @Transactional(readOnly = true)
    public boolean canAccessProjectChat(User currentUser, Long projectId) {
        if (currentUser == null || projectId == null) return false;
        if (currentUser.getRole() == Role.ROLE_ADMIN) return true;

        Project p = projectRepository.findById(projectId).orElse(null);
        if (p == null) return false;

        // 1. Is Client of project
        if (p.getClient() != null && p.getClient().getId().equals(currentUser.getId())) {
            return true;
        }

        // 2. Is Manager of project or any active Manager
        if (currentUser.getRole() == Role.ROLE_MANAGER) {
            return true;
        }

        // 3. Is Professional assigned to project
        if (workforceAllocationRepository.findByProjectIdAndProfessionalId(projectId, currentUser.getId()).isPresent()) {
            return true;
        }

        List<WorkforceAllocation> allocs = workforceAllocationRepository.findByProjectId(projectId);
        for (WorkforceAllocation wa : allocs) {
            if (wa.getProfessional() != null && wa.getProfessional().getId().equals(currentUser.getId())) {
                return true;
            }
        }

        return false;
    }
}
