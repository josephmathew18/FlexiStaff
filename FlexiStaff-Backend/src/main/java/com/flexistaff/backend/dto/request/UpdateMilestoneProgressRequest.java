package com.flexistaff.backend.dto.request;

import com.flexistaff.backend.entity.enums.MilestoneStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateMilestoneProgressRequest {

    @Min(value = 0, message = "Progress percentage must be at least 0")
    @Max(value = 100, message = "Progress percentage cannot exceed 100")
    private Integer progressPercentage;

    private MilestoneStatus status;
}
