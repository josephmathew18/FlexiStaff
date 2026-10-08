package com.flexistaff.backend.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerCompanyDto {

    private Long id;
    private Long numericId;
    private String companyName;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String location;
    private String city;
    private String industry;
    private String tier;
    private String specialties;
    private String status;
    private Integer suppliedProfessionals;
    private Integer activePlacements;
    private String availabilityRate;
    private Double rating;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
