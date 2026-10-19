package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FreelancerRegistrationRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email format")
    private String email;

    private String password;

    private String phone;
    private String title;
    private String skills;
    private String bio;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private String availabilityStatus;
    private Long partnerCompanyId;

    // Staff Badge Credentials (Mandatory for partner company employee verification)
    private String staffBadgeId;
    private String staffBadgeUrl;
    private String staffBadgeName;

    // Professional Profiles & Documents (Optional - can be added by workforce)
    private String linkedin;
    private String resumeUrl;
    private String resumeName;
    private String github;
}
