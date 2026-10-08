package com.flexistaff.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FreelancerDto {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String title;
    private String skills;
    private String bio;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private String availabilityStatus;
    private String status;
    private String roleType;
    private String professionalType;
    private String source;
    private String approvalStatus;
    private String verificationStatus;
    private String accountStatus;
    private Long partnerCompanyId;
    private String partnerCompany;
    private String partnerName;
    private String partnerCompanyName;
    private String currentProject;
    private Long currentProjectId;
    private String currentProjectName;
    private String currentProjectClient;
    private String currentProjectRole;
    private String currentAssignmentStatus;
    private String currentProjectStatus;
    private Boolean isCurrentlyWorking;
    private LocalDateTime createdAt;
}
