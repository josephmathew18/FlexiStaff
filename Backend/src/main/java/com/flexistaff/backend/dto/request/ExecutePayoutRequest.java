package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutePayoutRequest {

    private String payoutMethod;

    @NotBlank(message = "Gateway reference or external transaction UTR is required")
    private String gatewayTransactionId;

    private String notes;
}
