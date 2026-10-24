package com.flexistaff.backend.dto.chat;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {
    @NotNull(message = "Recipient user ID is required")
    private Long recipientUserId;

    private Long projectId;

    private String initialMessage;
}
