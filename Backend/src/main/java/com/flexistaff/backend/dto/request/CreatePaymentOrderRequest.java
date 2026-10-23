package com.flexistaff.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentOrderRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount; // Optional: If omitted, defaults to remaining balance

    private Boolean isFullBalance; // True if client chose to clear the remaining balance

    private String notes;
}
