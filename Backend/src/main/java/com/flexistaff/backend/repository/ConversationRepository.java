package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c " +
           "WHERE c.id IN (SELECT p.conversation.id FROM ConversationParticipant p WHERE p.user.id = :userId) " +
           "ORDER BY COALESCE(c.lastMessageTime, c.createdAt) DESC")
    List<Conversation> findAllByParticipantUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c " +
           "JOIN c.participants p1 " +
           "JOIN c.participants p2 " +
           "WHERE p1.user.id = :user1Id AND p2.user.id = :user2Id " +
           "AND ((:projectId IS NULL AND c.project IS NULL) OR c.project.id = :projectId)")
    List<Conversation> findBetweenUsersAndOptionalProject(@Param("user1Id") Long user1Id,
                                                          @Param("user2Id") Long user2Id,
                                                          @Param("projectId") Long projectId);

    @Query("SELECT c FROM Conversation c " +
           "JOIN c.participants p1 " +
           "JOIN c.participants p2 " +
           "WHERE p1.user.id = :user1Id AND p2.user.id = :user2Id AND c.project IS NULL")
    List<Conversation> findDirectBetweenUsers(@Param("user1Id") Long user1Id,
                                             @Param("user2Id") Long user2Id);
}
