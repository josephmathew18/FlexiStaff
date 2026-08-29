package com.flexistaff.backend.dto.response;

import com.flexistaff.backend.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Role role;
    private Boolean active;
    private String avatarUrl;
    private LocalDateTime createdAt;

    private ProfessionalDto professionalProfile;
    private ClientDto clientProfile;
}
