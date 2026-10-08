package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateFreelancerRequest {

    private String name;
    private String fullName;
    private String email;
    private String phone;
    private String title;
    private String skills;
    private String bio;

    @Min(value = 0, message = "Experience years cannot be negative")
    private Integer experienceYears;

    @PositiveOrZero(message = "Hourly rate cannot be negative")
    private BigDecimal hourlyRate;

    private String availabilityStatus;
    private String status;
    private Long partnerCompanyId;
}
