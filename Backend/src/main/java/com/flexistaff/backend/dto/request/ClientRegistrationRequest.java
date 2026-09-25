package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ClientRegistrationRequest {

    @NotBlank(message = "Contact person full name is required")
    private String fullName;

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String industry;
    private String tier;
    private String location;
}
