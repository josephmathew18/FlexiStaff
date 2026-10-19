package com.flexistaff.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets", indexes = {
    @Index(name = "idx_support_tickets_user_id", columnList = "user_id"),
    @Index(name = "idx_support_tickets_status", columnList = "status"),
    @Index(name = "idx_support_tickets_created_at", columnList = "created_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicket extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_name", nullable = false, length = 100)
    private String userName;

    @Column(name = "user_email", nullable = false, length = 100)
    private String userEmail;

    @Column(name = "user_role", nullable = false, length = 30)
    private String userRole;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String priority = "Normal";

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "Pending Admin Review";

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @Column(name = "responded_by")
    private Long respondedBy;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
}
