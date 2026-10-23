package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByClientIdOrderByCreatedAtDesc(Long clientId);

    List<Payment> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<Payment> findByProjectIdAndClientIdOrderByCreatedAtDesc(Long projectId, Long clientId);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    Optional<Payment> findByReceiptNumber(String receiptNumber);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.project.id = :projectId AND p.status = com.flexistaff.backend.entity.enums.PaymentStatus.SUCCESS")
    BigDecimal sumPaidAmountByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.client.id = :clientId AND p.status = com.flexistaff.backend.entity.enums.PaymentStatus.SUCCESS")
    BigDecimal sumPaidAmountByClientId(@Param("clientId") Long clientId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = com.flexistaff.backend.entity.enums.PaymentStatus.SUCCESS")
    BigDecimal sumTotalSuccessfulPayments();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = com.flexistaff.backend.entity.enums.PaymentStatus.REFUNDED")
    BigDecimal sumTotalRefundedPayments();

    long countByStatus(com.flexistaff.backend.entity.enums.PaymentStatus status);

    List<Payment> findAllByOrderByCreatedAtDesc();
}
