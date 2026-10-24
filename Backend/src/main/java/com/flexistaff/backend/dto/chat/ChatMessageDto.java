package com.flexistaff.backend.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String senderAvatar;
    private String content;
    private String messageType;
    private String attachmentUrl;
    private String attachmentName;
    private Long attachmentSize;
    private String attachmentType;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private Boolean isMine;
}
