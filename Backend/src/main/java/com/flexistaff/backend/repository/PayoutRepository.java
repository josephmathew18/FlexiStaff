package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.Payout;
import com.flexistaff.backend.entity.enums.PayoutStatus;
import com.flexistaff.backend.entity.enums.PayoutType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, Long> {

    List<Payout> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<Payout> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<Payout> findByPayoutTypeOrderByCreatedAtDesc(PayoutType payoutType);

    List<Payout> findByStatusOrderByCreatedAtDesc(PayoutStatus status);

    Optional<Payout> findByReferenceNumber(String referenceNumber);

    @Query("SELECT COALESCE(SUM(p.netAmount), 0) FROM Payout p WHERE p.payoutType = :payoutType AND p.status = 'COMPLETED'")
    BigDecimal sumCompletedAmountByType(@Param("payoutType") PayoutType payoutType);

    @Query("SELECT COALESCE(SUM(p.netAmount), 0) FROM Payout p WHERE p.status IN :statuses")
    BigDecimal sumAmountByStatusIn(@Param("statuses") Collection<PayoutStatus> statuses);

    @Query("SELECT COALESCE(SUM(p.grossAmount), 0) FROM Payout p WHERE p.recipient.id = :recipientId AND p.project.id = :projectId AND p.status IN ('APPROVED', 'PROCESSING', 'COMPLETED')")
    BigDecimal sumPaidAmountByRecipientIdAndProjectId(@Param("recipientId") Long recipientId, @Param("projectId") Long projectId);

    @Query("SELECT COALESCE(SUM(p.grossAmount), 0) FROM Payout p WHERE p.milestone.id = :milestoneId AND p.status IN ('APPROVED', 'PROCESSING', 'COMPLETED')")
    BigDecimal sumPaidAmountByMilestoneId(@Param("milestoneId") Long milestoneId);

    @Query("SELECT COALESCE(SUM(p.netAmount), 0) FROM Payout p WHERE p.recipient.id = :recipientId AND p.status = 'COMPLETED'")
    BigDecimal sumCompletedPaidByRecipientId(@Param("recipientId") Long recipientId);

    @Query("SELECT COALESCE(SUM(p.grossAmount), 0) FROM Payout p WHERE p.recipient.id = :recipientId AND p.status = 'COMPLETED'")
    BigDecimal sumCompletedGrossPaidByRecipientId(@Param("recipientId") Long recipientId);

    @Query("SELECT COALESCE(SUM(p.fee + p.deductions), 0) FROM Payout p WHERE p.recipient.id = :recipientId AND p.status = 'COMPLETED'")
    BigDecimal sumCompletedDeductionsByRecipientId(@Param("recipientId") Long recipientId);

    @Query("SELECT COALESCE(SUM(p.netAmount), 0) FROM Payout p WHERE p.recipient.id = :recipientId AND p.status IN ('PENDING_APPROVAL', 'APPROVED')")
    BigDecimal sumPendingByRecipientId(@Param("recipientId") Long recipientId);

    @Query("SELECT COALESCE(SUM(p.netAmount), 0) FROM Payout p WHERE p.recipient.id = :recipientId AND p.status = 'PROCESSING'")
    BigDecimal sumProcessingByRecipientId(@Param("recipientId") Long recipientId);

    @Query("SELECT COALESCE(SUM(p.netAmount), 0) FROM Payout p WHERE p.recipient.id = :recipientId AND p.status = 'FAILED'")
    BigDecimal sumFailedByRecipientId(@Param("recipientId") Long recipientId);

    long countByStatus(PayoutStatus status);

    long countByStatusIn(Collection<PayoutStatus> statuses);
}
