package com.flexistaff.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClientDto {

    private Long id;
    private Long userId;
    private String name;
    private String companyName;
    private String email;
    private String phone;
    private String contactPhone;
    private String industry;
    private String tier;
    private String location;
    private String status;
    private String logoUrl;
    private Integer activeProjects;
    private String totalSpent;
    private LocalDateTime createdAt;
}
