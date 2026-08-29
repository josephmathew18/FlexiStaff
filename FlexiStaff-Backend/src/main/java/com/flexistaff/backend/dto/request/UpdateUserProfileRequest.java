package com.flexistaff.backend.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateUserProfileRequest {

    private String fullName;
    private String phone;
    private String avatarUrl;

    // Professional fields
    private String title;
    private String bio;
    private String skills;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private String availabilityStatus;

    // Client fields
    private String companyName;
    private String industry;
    private String tier;
    private String location;
}
