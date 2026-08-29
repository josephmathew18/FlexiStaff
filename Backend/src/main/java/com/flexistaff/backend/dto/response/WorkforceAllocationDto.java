package com.flexistaff.backend.dto.response;

import com.flexistaff.backend.entity.enums.AllocationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkforceAllocationDto {

    private Long id;
    private Long projectId;
    private String projectTitle;
    private Long professionalId;
    private String professionalName;
    private String professionalEmail;
    private String roleInProject;
    private Integer allocatedHoursPerWeek;
    private BigDecimal billableRate;
    private AllocationStatus status;
    private LocalDateTime createdAt;
}
