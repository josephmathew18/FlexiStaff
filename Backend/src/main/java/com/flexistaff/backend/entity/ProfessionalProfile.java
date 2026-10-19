package com.flexistaff.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "professional_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfessionalProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String skills; // Comma separated list of skills e.g., "Java, Spring Boot, React, AI"

    private Integer experienceYears;

    private BigDecimal hourlyRate;

    private String availabilityStatus; // e.g., "Available", "Allocated", "Partially Available"

    private Double rating;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_company_id")
    private PartnerCompany partnerCompany;

    @Column(name = "staff_badge_id", length = 100)
    private String staffBadgeId;

    @Column(name = "staff_badge_url", columnDefinition = "TEXT")
    private String staffBadgeUrl;

    @Column(name = "staff_badge_name")
    private String staffBadgeName;

    @Column(name = "linkedin", length = 500)
    private String linkedin;

    @Column(name = "resume_url", columnDefinition = "TEXT")
    private String resumeUrl;

    @Column(name = "resume_name")
    private String resumeName;

    @Column(name = "github", length = 500)
    private String github;
}
