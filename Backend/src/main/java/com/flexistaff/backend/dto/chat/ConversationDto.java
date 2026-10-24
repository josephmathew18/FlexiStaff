package com.flexistaff.backend.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private Long id;
    private String conversationType;
    private Long projectId;
    private String projectTitle;
    private String title;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private String lastSenderName;
    private long unreadCount;
    private ChatContactDto otherParticipant;
    private List<ChatContactDto> participants;
}
