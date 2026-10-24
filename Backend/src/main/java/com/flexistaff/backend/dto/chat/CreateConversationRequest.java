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
    private Long recipientUserId;

    private Long projectId;

    private Boolean isGroup;

    private String initialMessage;
}
