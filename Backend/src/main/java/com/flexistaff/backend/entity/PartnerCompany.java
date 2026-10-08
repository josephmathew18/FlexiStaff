package com.flexistaff.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "partner_companies", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerCompany extends BaseEntity {

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String name;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 20)
    private String phone;

    private String location;

    private String industry;

    private String tier;

    @Column(columnDefinition = "TEXT")
    private String specialties;

    @Builder.Default
    @Column(nullable = false)
    private String status = "Active";

    @Column(name = "supplied_professionals")
    @Builder.Default
    private Integer suppliedProfessionals = 0;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
