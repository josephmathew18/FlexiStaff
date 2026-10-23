package com.flexistaff.backend.dto.response;

import com.flexistaff.backend.entity.enums.PaymentStatus;
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
public class PaymentDto {

    private Long id;
    private Long projectId;
    private String projectTitle;
    private Long clientId;
    private String clientName;
    private String clientEmail;
    private BigDecimal amount;
    private String currency;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private PaymentStatus status;
    private String paymentMethod;
    private String receiptNumber;
    private String notes;
    private String failureReason;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
