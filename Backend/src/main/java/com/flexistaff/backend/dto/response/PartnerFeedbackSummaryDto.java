package com.flexistaff.backend.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerFeedbackSummaryDto {

    private Long partnerCompanyId;
    private String partnerCompanyName;
    private Double averageRating;
    private Long reviewCount;
    private List<ProfessionalFeedbackDto> feedbacks;
}
