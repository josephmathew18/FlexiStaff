package com.flexistaff.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "client_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    private String industry;

    private String tier; // e.g. "Enterprise Platinum", "Gold", "Standard"

    private String location;

    private String contactPhone;

    private String logoUrl;
}
