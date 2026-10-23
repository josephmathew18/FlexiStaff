package com.flexistaff.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptDto {

    private String receiptNumber;
    private Long paymentId;
    private Long projectId;
    private String projectTitle;
    private Long clientId;
    private String clientName;
    private String clientCompanyName;
    private String clientEmail;
    private String clientPhone;
    private BigDecimal amountPaid;
    private String currency;
    private String paymentMethod;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String paymentStatus;
    private LocalDateTime paymentDate;
    private String issuedBy;
}
