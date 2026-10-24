package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    Optional<ConversationParticipant> findByConversationIdAndUserId(Long conversationId, Long userId);

    boolean existsByConversationIdAndUserId(Long conversationId, Long userId);

    List<ConversationParticipant> findByConversationId(Long conversationId);

    List<ConversationParticipant> findByUserId(Long userId);
}
