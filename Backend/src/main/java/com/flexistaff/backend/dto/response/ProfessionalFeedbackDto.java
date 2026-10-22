package com.flexistaff.backend.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfessionalFeedbackDto {

    private Long id;
    private Long projectId;
    private String projectTitle;
    private Long clientId;
    private String clientName;
    private String clientCompanyName;
    private Long professionalId;
    private String professionalName;
    private String professionalEmail;
    private String workforceType; // "Partner Company" or "Independent Freelancer"
    private Long partnerCompanyId;
    private String partnerCompanyName;
    private String roleInProject;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
