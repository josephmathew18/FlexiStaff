package com.flexistaff.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {

    private String orderId;
    private BigDecimal amount;
    private Long amountInPaise;
    private String currency;
    private String keyId;
    private Long projectId;
    private String projectTitle;
    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private String companyName;
    private String receiptNumber;
    private Boolean isTestMode;
}
