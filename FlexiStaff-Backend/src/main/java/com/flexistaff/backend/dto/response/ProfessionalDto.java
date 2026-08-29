package com.flexistaff.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfessionalDto {

    private Long id;
    private String title;
    private String bio;
    private String skills;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private String availabilityStatus;
    private Double rating;
}
