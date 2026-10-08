package com.flexistaff.backend.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateManagerRequest {

    private String name;
    private String email;
    private String phone;
    private String jobTitle;
    private String department;
    private String experience;
    private String bio;
    private String status;
    private String avatar;
}
