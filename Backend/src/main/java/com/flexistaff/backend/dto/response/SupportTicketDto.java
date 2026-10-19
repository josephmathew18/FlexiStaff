package com.flexistaff.backend.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicketDto {

    private Long id;
    private Long userId;
    private String senderName;
    private String senderEmail;
    private String senderRole;
    private String userName;
    private String userEmail;
    private String userRole;
    private String category;
    private String subject;
    private String message;
    private String priority;
    private String status;
    private String adminResponse;
    private Long respondedBy;
    private LocalDateTime respondedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String submittedAt;
}
