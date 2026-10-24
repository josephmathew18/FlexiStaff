package com.flexistaff.backend.entity;

import com.flexistaff.backend.entity.enums.ConversationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "conversation_type", nullable = false)
    @Builder.Default
    private ConversationType conversationType = ConversationType.DIRECT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    private String title;

    @Column(name = "last_message_content", columnDefinition = "TEXT")
    private String lastMessageContent;

    @Column(name = "last_message_time")
    private LocalDateTime lastMessageTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_sender_id")
    private User lastSender;

    @Builder.Default
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConversationParticipant> participants = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();
}
