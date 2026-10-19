package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTicketRequest {

    private String category;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message is required")
    private String message;

    private String priority;

    // Optional frontend overrides if sender profile name differs from user full_name
    private String senderRole;
    private String senderName;
    private String senderEmail;
}
