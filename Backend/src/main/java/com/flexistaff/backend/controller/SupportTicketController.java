package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.request.CreateTicketRequest;
import com.flexistaff.backend.dto.request.UpdateTicketStatusRequest;
import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.dto.response.SupportTicketDto;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.repository.UserRepository;
import com.flexistaff.backend.service.SupportTicketService;
import com.flexistaff.backend.utility.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
@Slf4j
public class SupportTicketController {

    private final SupportTicketService supportTicketService;
    private final UserRepository userRepository;

    @PostMapping("/tickets")
    public ResponseEntity<ApiResponse<SupportTicketDto>> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        User currentUser = getCurrentUser();
        SupportTicketDto dto = supportTicketService.createTicket(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Support ticket submitted successfully", dto));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<SupportTicketDto>>> getAllTickets() {
        List<SupportTicketDto> tickets = supportTicketService.getAllTickets();
        return ResponseEntity.ok(ApiResponse.success("Support tickets retrieved successfully", tickets));
    }

    @GetMapping("/tickets/my")
    public ResponseEntity<ApiResponse<List<SupportTicketDto>>> getMyTickets(
            @RequestParam(required = false) String email) {
        User currentUser = getCurrentUser();
        if (currentUser == null && email != null && !email.isBlank()) {
            currentUser = userRepository.findByEmailIgnoreCase(email.trim()).orElse(null);
        }
        List<SupportTicketDto> tickets = supportTicketService.getTicketsByUser(currentUser);
        return ResponseEntity.ok(ApiResponse.success("User support tickets retrieved successfully", tickets));
    }

    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<ApiResponse<SupportTicketDto>> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody UpdateTicketStatusRequest request) {
        User adminUser = getCurrentUser();
        SupportTicketDto updated = supportTicketService.updateTicketStatus(id, request, adminUser);
        return ResponseEntity.ok(ApiResponse.success("Support ticket status updated successfully", updated));
    }

    private User getCurrentUser() {
        return SecurityUtils.getCurrentUserId()
                .flatMap(userRepository::findById)
                .orElse(null);
    }
}
