package com.flexistaff.backend.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyFeedbackDto {

    private Long id;
    private Long projectId;
    private String projectTitle;
    private Long clientId;
    private String clientName;
    private String clientCompanyName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
