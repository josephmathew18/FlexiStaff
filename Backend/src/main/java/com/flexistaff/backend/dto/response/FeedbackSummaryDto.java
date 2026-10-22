package com.flexistaff.backend.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackSummaryDto {

    private Double companyAverageRating;
    private Long companyReviewCount;

    private Double employeeAverageRating;
    private Long employeeReviewCount;

    private Double freelancerAverageRating;
    private Long freelancerReviewCount;

    private Double overallAverageRating;
    private Long totalReviewCount;

    private List<CompanyFeedbackDto> companyFeedbacks;
    private List<ProfessionalFeedbackDto> professionalFeedbacks;
}
