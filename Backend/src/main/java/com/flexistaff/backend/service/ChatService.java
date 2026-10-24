package com.flexistaff.backend.service;

import com.flexistaff.backend.dto.chat.*;
import com.flexistaff.backend.entity.*;
import com.flexistaff.backend.entity.enums.ConversationType;
import com.flexistaff.backend.entity.enums.MessageType;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ChatSecurityService chatSecurityService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<ConversationDto> getUserConversations(User currentUser) {
        if (currentUser == null) return Collections.emptyList();

        List<Conversation> conversations = conversationRepository.findAllByParticipantUserId(currentUser.getId());
        return conversations.stream()
                .map(c -> mapToConversationDto(c, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional
    public ConversationDto getOrCreateConversation(User currentUser, CreateConversationRequest request) {
        if (currentUser == null) throw new AccessDeniedException("User must be authenticated");

        Long recipientId = request.getRecipientUserId();
        if (currentUser.getId().equals(recipientId)) {
            throw new IllegalArgumentException("Cannot create a conversation with yourself");
        }

        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recipientId));

        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId()).orElse(null);
        }

        // Verify role-based permission
        boolean allowed = chatSecurityService.canCommunicate(currentUser, recipient, request.getProjectId());
        if (!allowed) {
            log.warn("Communication rejected between user {} and user {} with project {}",
                    currentUser.getId(), recipientId, request.getProjectId());
            throw new AccessDeniedException("You are not authorized to start a conversation with this user.");
        }

        // Check if conversation already exists
        List<Conversation> existing = conversationRepository.findBetweenUsersAndOptionalProject(
                currentUser.getId(), recipientId, request.getProjectId());

        Conversation conversation;
        if (!existing.isEmpty()) {
            conversation = existing.get(0);
        } else {
            // Create new conversation
            ConversationType type = (project != null) ? ConversationType.PROJECT : ConversationType.DIRECT;
            String title = (project != null) ? project.getTitle() : recipient.getFullName();

            conversation = Conversation.builder()
                    .conversationType(type)
                    .project(project)
                    .createdBy(currentUser)
                    .title(title)
                    .lastMessageTime(LocalDateTime.now())
                    .build();

            conversation = conversationRepository.save(conversation);

            // Add participants
            ConversationParticipant p1 = ConversationParticipant.builder()
                    .conversation(conversation)
                    .user(currentUser)
                    .lastReadAt(LocalDateTime.now())
                    .build();

            ConversationParticipant p2 = ConversationParticipant.builder()
                    .conversation(conversation)
                    .user(recipient)
                    .build();

            participantRepository.save(p1);
            participantRepository.save(p2);

            conversation.getParticipants().add(p1);
            conversation.getParticipants().add(p2);
        }

        // Send initial message if provided
        if (request.getInitialMessage() != null && !request.getInitialMessage().trim().isEmpty()) {
            SendMessageRequest msgReq = SendMessageRequest.builder()
                    .content(request.getInitialMessage().trim())
                    .messageType("TEXT")
                    .build();
            sendMessage(currentUser, conversation.getId(), msgReq);
        }

        return mapToConversationDto(conversation, currentUser);
    }

    @Transactional
    public List<ChatMessageDto> getConversationMessages(User currentUser, Long conversationId) {
        verifyParticipant(conversationId, currentUser.getId());

        List<ChatMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        // Mark messages as read for this user
        messageRepository.markAllAsReadInConversation(conversationId, currentUser.getId());
        participantRepository.findByConversationIdAndUserId(conversationId, currentUser.getId()).ifPresent(p -> {
            p.setLastReadAt(LocalDateTime.now());
            participantRepository.save(p);
        });

        return messages.stream()
                .map(m -> mapToMessageDto(m, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageDto sendMessage(User currentUser, Long conversationId, SendMessageRequest request) {
        verifyParticipant(conversationId, currentUser.getId());

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        MessageType msgType = MessageType.TEXT;
        if (request.getMessageType() != null) {
            try {
                msgType = MessageType.valueOf(request.getMessageType().toUpperCase());
            } catch (Exception ignored) {}
        }

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .sender(currentUser)
                .content(request.getContent() != null ? request.getContent().trim() : "")
                .messageType(msgType)
                .attachmentUrl(request.getAttachmentUrl())
                .attachmentName(request.getAttachmentName())
                .attachmentSize(request.getAttachmentSize())
                .attachmentType(request.getAttachmentType())
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        // Update conversation summary
        String preview = message.getContent();
        if ((preview == null || preview.isEmpty()) && message.getAttachmentName() != null) {
            preview = "📎 " + message.getAttachmentName();
        }
        conversation.setLastMessageContent(preview);
        conversation.setLastMessageTime(message.getCreatedAt() != null ? message.getCreatedAt() : LocalDateTime.now());
        conversation.setLastSender(currentUser);
        conversationRepository.save(conversation);

        // Update sender's lastReadAt
        participantRepository.findByConversationIdAndUserId(conversationId, currentUser.getId()).ifPresent(p -> {
            p.setLastReadAt(LocalDateTime.now());
            participantRepository.save(p);
        });

        ChatMessageDto dto = mapToMessageDto(message, currentUser);

        // Broadcast to WebSocket subscribers for this conversation
        try {
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, dto);
            
            // Notify other participants
            for (ConversationParticipant p : conversation.getParticipants()) {
                if (p.getUser() != null && !p.getUser().getId().equals(currentUser.getId())) {
                    messagingTemplate.convertAndSend("/topic/user/" + p.getUser().getId() + "/notifications", dto);
                }
            }
        } catch (Exception ex) {
            log.warn("WebSocket broadcast failed (fallback to polling active): {}", ex.getMessage());
        }

        return dto;
    }

    @Transactional
    public void markConversationAsRead(User currentUser, Long conversationId) {
        verifyParticipant(conversationId, currentUser.getId());
        messageRepository.markAllAsReadInConversation(conversationId, currentUser.getId());
        participantRepository.findByConversationIdAndUserId(conversationId, currentUser.getId()).ifPresent(p -> {
            p.setLastReadAt(LocalDateTime.now());
            participantRepository.save(p);
        });
    }

    @Transactional(readOnly = true)
    public long getTotalUnreadCount(User currentUser) {
        if (currentUser == null) return 0;
        return messageRepository.countTotalUnreadForUser(currentUser.getId());
    }

    private void verifyParticipant(Long conversationId, Long userId) {
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new AccessDeniedException("You are not a participant in this conversation.");
        }
    }

    private ConversationDto mapToConversationDto(Conversation c, User currentUser) {
        long unread = messageRepository.countUnreadInConversation(c.getId(), currentUser.getId());

        List<ChatContactDto> participants = c.getParticipants().stream()
                .filter(p -> p.getUser() != null)
                .map(p -> mapUserToContact(p.getUser(), c.getProject()))
                .collect(Collectors.toList());

        ChatContactDto other = participants.stream()
                .filter(p -> !p.getId().equals(currentUser.getId()))
                .findFirst()
                .orElse(null);

        String displayTitle = c.getTitle();
        if ((displayTitle == null || displayTitle.isBlank()) && other != null) {
            displayTitle = other.getFullName();
        }

        return ConversationDto.builder()
                .id(c.getId())
                .conversationType(c.getConversationType() != null ? c.getConversationType().name() : "DIRECT")
                .projectId(c.getProject() != null ? c.getProject().getId() : null)
                .projectTitle(c.getProject() != null ? c.getProject().getTitle() : null)
                .title(displayTitle)
                .lastMessage(c.getLastMessageContent())
                .lastMessageTime(c.getLastMessageTime())
                .lastSenderName(c.getLastSender() != null ? c.getLastSender().getFullName() : null)
                .unreadCount(unread)
                .otherParticipant(other)
                .participants(participants)
                .build();
    }

    private ChatMessageDto mapToMessageDto(ChatMessage m, User currentUser) {
        boolean isMine = m.getSender() != null && currentUser != null && m.getSender().getId().equals(currentUser.getId());
        return ChatMessageDto.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender() != null ? m.getSender().getId() : null)
                .senderName(m.getSender() != null ? m.getSender().getFullName() : "Unknown")
                .senderRole(m.getSender() != null && m.getSender().getRole() != null ? m.getSender().getRole().name() : null)
                .senderAvatar(m.getSender() != null ? m.getSender().getAvatarUrl() : null)
                .content(m.getContent())
                .messageType(m.getMessageType() != null ? m.getMessageType().name() : "TEXT")
                .attachmentUrl(m.getAttachmentUrl())
                .attachmentName(m.getAttachmentName())
                .attachmentSize(m.getAttachmentSize())
                .attachmentType(m.getAttachmentType())
                .isRead(m.getIsRead())
                .createdAt(m.getCreatedAt())
                .isMine(isMine)
                .build();
    }

    private ChatContactDto mapUserToContact(User user, Project project) {
        String roleStr = user.getRole() != null ? user.getRole().name() : "USER";
        if (roleStr.startsWith("ROLE_")) roleStr = roleStr.substring(5);

        String company = null;
        if (user.getClientProfile() != null) company = user.getClientProfile().getCompanyName();
        else if (user.getPartnerCompany() != null) company = user.getPartnerCompany().getCompanyName();

        return ChatContactDto.builder()
                .id(user.getId())
                .fullName(user.getFullName() != null ? user.getFullName() : user.getEmail())
                .email(user.getEmail())
                .role(roleStr)
                .avatarUrl(user.getAvatarUrl())
                .companyName(company)
                .organization(company)
                .projectId(project != null ? project.getId() : null)
                .projectTitle(project != null ? project.getTitle() : null)
                .online(true)
                .build();
    }
}
