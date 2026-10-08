package com.flexistaff.backend.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagerDto {

    private Long id;              // Primary ID (mapped to users.id)
    private Long profileId;       // hr_managers.id
    private Long userId;          // users.id
    private String employeeId;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String jobTitle;
    private String department;
    private String experience;
    private String bio;
    private String dob;
    private String address;
    private String avatar;
    private String status;
    private String joinDate;
    private Integer assignedProjectsCount;
    private Integer teamSize;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
