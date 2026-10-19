package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.request.CreateTicketRequest;
import com.flexistaff.backend.dto.request.UpdateTicketStatusRequest;
import com.flexistaff.backend.dto.response.SupportTicketDto;
import com.flexistaff.backend.entity.SupportTicket;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.repository.SupportTicketRepository;
import com.flexistaff.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter UI_FORMATTER = DateTimeFormatter.ofPattern("M/d/yy, h:mm a");

    @Transactional
    public SupportTicketDto createTicket(User user, CreateTicketRequest req) {
        if (user == null) {
            if (req.getSenderEmail() != null && !req.getSenderEmail().isBlank()) {
                user = userRepository.findByEmailIgnoreCase(req.getSenderEmail().trim()).orElse(null);
            }
            if (user == null && req.getSenderRole() != null) {
                String role = req.getSenderRole().trim();
                if (role.equalsIgnoreCase("Client")) {
                    user = userRepository.findByEmailIgnoreCase("client@flexistaff.com").orElse(null);
                } else if (role.equalsIgnoreCase("Manager")) {
                    user = userRepository.findByEmailIgnoreCase("thomas@flexistaff.com").orElse(null);
                } else if (role.equalsIgnoreCase("Partner")) {
                    user = userRepository.findByEmailIgnoreCase("partner@gmail.com").orElse(null);
                } else if (role.equalsIgnoreCase("Workforce") || role.equalsIgnoreCase("Freelancer")) {
                    user = userRepository.findByEmailIgnoreCase("mathew@flexistaff.com").orElse(null);
                }
            }
            if (user == null) {
                user = userRepository.findByEmailIgnoreCase("admin@flexistaff.com")
                        .or(() -> userRepository.findAll().stream().findFirst())
                        .orElse(null);
            }
        }

        String roleName = resolveSenderRole(user, req.getSenderRole());
        String senderName = (req.getSenderName() != null && !req.getSenderName().isBlank())
                ? req.getSenderName().trim()
                : (user != null ? user.getFullName() : "Anonymous User");
        String senderEmail = (req.getSenderEmail() != null && !req.getSenderEmail().isBlank())
                ? req.getSenderEmail().trim()
                : (user != null ? user.getEmail() : "support@flexistaff.com");

        String priority = (req.getPriority() != null && !req.getPriority().isBlank())
                ? req.getPriority().trim()
                : "Normal";
        String category = (req.getCategory() != null && !req.getCategory().isBlank())
                ? req.getCategory().trim()
                : "General Feedback";

        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .userName(senderName)
                .userEmail(senderEmail)
                .userRole(roleName)
                .category(category)
                .subject(req.getSubject().trim())
                .message(req.getMessage().trim())
                .priority(priority)
                .status("Pending Admin Review")
                .build();

        SupportTicket saved = supportTicketRepository.save(ticket);
        log.info("Created support ticket #{} for user {} ({})", saved.getId(), senderEmail, roleName);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SupportTicketDto> getAllTickets() {
        return supportTicketRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SupportTicketDto> getTicketsByUser(User user) {
        if (user == null) {
            return List.of();
        }
        return supportTicketRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public SupportTicketDto updateTicketStatus(Long ticketId, UpdateTicketStatusRequest req, User adminUser) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket", "id", ticketId));

        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            ticket.setStatus(req.getStatus().trim());
        }

        if (req.getAdminResponse() != null) {
            ticket.setAdminResponse(req.getAdminResponse().trim());
            ticket.setRespondedBy(adminUser != null ? adminUser.getId() : null);
            ticket.setRespondedAt(LocalDateTime.now());
        }

        SupportTicket updated = supportTicketRepository.save(ticket);
        log.info("Updated support ticket #{} status to '{}'", updated.getId(), updated.getStatus());
        return toDto(updated);
    }

    @Transactional
    public void deleteTicket(Long ticketId) {
        if (!supportTicketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("SupportTicket", "id", ticketId);
        }
        supportTicketRepository.deleteById(ticketId);
        log.info("Deleted support ticket #{}", ticketId);
    }

    @Transactional
    public void deleteAllTickets() {
        supportTicketRepository.deleteAll();
        log.info("Cleared all support tickets from database");
    }

    @Transactional
    public List<SupportTicketDto> clearAllTicketStatus() {
        List<SupportTicket> all = supportTicketRepository.findAll();
        for (SupportTicket t : all) {
            t.setStatus("Pending Admin Review");
            t.setAdminResponse(null);
            t.setRespondedAt(null);
            t.setRespondedBy(null);
        }
        List<SupportTicket> saved = supportTicketRepository.saveAll(all);
        log.info("Reset/cleared status for {} support tickets", saved.size());
        return saved.stream().map(this::toDto).toList();
    }

    public SupportTicketDto toDto(SupportTicket ticket) {
        String formattedDate = ticket.getCreatedAt() != null
                ? ticket.getCreatedAt().format(UI_FORMATTER)
                : LocalDateTime.now().format(UI_FORMATTER);

        return SupportTicketDto.builder()
                .id(ticket.getId())
                .userId(ticket.getUser() != null ? ticket.getUser().getId() : null)
                .senderName(ticket.getUserName())
                .userName(ticket.getUserName())
                .senderEmail(ticket.getUserEmail())
                .userEmail(ticket.getUserEmail())
                .senderRole(ticket.getUserRole())
                .userRole(ticket.getUserRole())
                .category(ticket.getCategory())
                .subject(ticket.getSubject())
                .message(ticket.getMessage())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .adminResponse(ticket.getAdminResponse())
                .respondedBy(ticket.getRespondedBy())
                .respondedAt(ticket.getRespondedAt())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .submittedAt(formattedDate)
                .build();
    }

    private String resolveSenderRole(User user, String overrideRole) {
        if (overrideRole != null && !overrideRole.isBlank()) {
            String o = overrideRole.trim();
            if (o.equalsIgnoreCase("Client") || o.equalsIgnoreCase("ROLE_CLIENT")) return "Client";
            if (o.equalsIgnoreCase("Manager") || o.equalsIgnoreCase("ROLE_MANAGER")) return "Manager";
            if (o.equalsIgnoreCase("Partner") || o.equalsIgnoreCase("ROLE_PARTNER")) return "Partner";
            if (o.equalsIgnoreCase("Workforce") || o.equalsIgnoreCase("Freelancer") || o.equalsIgnoreCase("ROLE_FREELANCER")) return "Workforce";
            return o;
        }
        if (user == null || user.getRole() == null) return "User";
        return switch (user.getRole()) {
            case ROLE_CLIENT -> "Client";
            case ROLE_MANAGER -> "Manager";
            case ROLE_PARTNER -> "Partner";
            case ROLE_PROFESSIONAL -> "Workforce";
            case ROLE_ADMIN -> "Admin";
        };
    }
}
