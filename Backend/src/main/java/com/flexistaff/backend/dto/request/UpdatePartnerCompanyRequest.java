package com.flexistaff.backend.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePartnerCompanyRequest {

    private String name;

    private String companyName;

    private String contactPerson;

    private String email;

    private String phone;

    private String location;

    private String industry;

    private String tier;

    private String specialties;

    private String status;

    private Integer suppliedProfessionals;
}
