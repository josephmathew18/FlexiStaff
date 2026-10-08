package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateManagerRequest {

    private String employeeId;

    @NotBlank(message = "Manager name is required")
    private String name;

    @NotBlank(message = "Manager email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private String password;
    private String tempPassword;
    private String jobTitle;
    private String department;
    private String experience;
    private String bio;
    private String dob;
    private String address;
    private String avatar;
    private String status;
    private String accountStatus;
    private String joinDate;
    private String loginEmail;
}
