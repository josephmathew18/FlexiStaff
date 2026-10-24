package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    long countUnreadInConversation(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM ChatMessage m JOIN m.conversation.participants p WHERE p.user.id = :userId AND m.sender.id != :userId AND m.isRead = false")
    long countTotalUnreadForUser(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    int markAllAsReadInConversation(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}
