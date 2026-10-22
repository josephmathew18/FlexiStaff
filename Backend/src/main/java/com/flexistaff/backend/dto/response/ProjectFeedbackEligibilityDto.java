package com.flexistaff.backend.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectFeedbackEligibilityDto {

    private Long projectId;
    private String projectTitle;
    private String projectStatus;
    private boolean isCompleted;

    private boolean companyFeedbackSubmitted;
    private CompanyFeedbackDto companyFeedback;

    private List<AssignedProfessionalFeedbackStatus> assignedProfessionals;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssignedProfessionalFeedbackStatus {
        private Long professionalId;
        private String professionalName;
        private String professionalEmail;
        private String roleInProject;
        private String workforceType;
        private Long partnerCompanyId;
        private String partnerCompanyName;
        private boolean feedbackSubmitted;
        private ProfessionalFeedbackDto feedback;
    }
}
