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
}
