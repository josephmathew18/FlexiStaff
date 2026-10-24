package com.flexistaff.backend.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatContactDto {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String avatarUrl;
    private String companyName;
    private String organization;
    private Long projectId;
    private String projectTitle;
    private boolean online;
}
