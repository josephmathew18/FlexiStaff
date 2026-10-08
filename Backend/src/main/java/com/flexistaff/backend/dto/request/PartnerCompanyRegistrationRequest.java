package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerCompanyRegistrationRequest {

    private String name;

    private String companyName;

    private String contactPerson;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;

    private String password;

    private String tempPassword;

    private String location;

    private String industry;

    private String tier;

    private String specialties;

    private String status;

    private Integer suppliedProfessionals;
}
