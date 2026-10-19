package com.flexistaff.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "freelancers", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Freelancer extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(nullable = false)
    private String password;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "hourly_rate")
    private BigDecimal hourlyRate;

    @Column(name = "availability_status")
    @Builder.Default
    private String availabilityStatus = "Available";

    @Builder.Default
    @Column(nullable = false)
    private String status = "Active";

    @Column(name = "partner_company_id")
    private Long partnerCompanyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_company_id", insertable = false, updatable = false)
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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
