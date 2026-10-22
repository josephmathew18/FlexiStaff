package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.Feedback;
import com.flexistaff.backend.entity.FeedbackType;
import com.flexistaff.backend.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // --- COMPANY FEEDBACK QUERIES ---
    boolean existsByProjectIdAndClientIdAndFeedbackType(Long projectId, Long clientId, FeedbackType feedbackType);

    Optional<Feedback> findByProjectIdAndClientIdAndFeedbackType(Long projectId, Long clientId, FeedbackType feedbackType);

    List<Feedback> findByClientIdAndFeedbackType(Long clientId, FeedbackType feedbackType);

    List<Feedback> findByFeedbackTypeOrderByCreatedAtDesc(FeedbackType feedbackType);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.feedbackType = :type")
    Double calculateAverageRatingByFeedbackType(@Param("type") FeedbackType type);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.feedbackType = :type")
    Long countByFeedbackType(@Param("type") FeedbackType type);


    // --- PROFESSIONAL FEEDBACK QUERIES ---
    boolean existsByProjectIdAndProfessionalIdAndFeedbackType(Long projectId, Long professionalId, FeedbackType feedbackType);

    Optional<Feedback> findByProjectIdAndProfessionalIdAndFeedbackType(Long projectId, Long professionalId, FeedbackType feedbackType);

    List<Feedback> findByProfessionalIdAndFeedbackType(Long professionalId, FeedbackType feedbackType);

    List<Feedback> findByClientIdAndFeedbackTypeOrderByCreatedAtDesc(Long clientId, FeedbackType feedbackType);

    List<Feedback> findByProfessionalIdInAndFeedbackTypeOrderByCreatedAtDesc(List<Long> professionalIds, FeedbackType feedbackType);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.feedbackType = :type AND f.professional.id = :professionalId")
    Double calculateAverageRatingForProfessional(@Param("type") FeedbackType type, @Param("professionalId") Long professionalId);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.feedbackType = :type AND f.professional.id = :professionalId")
    Long countByFeedbackTypeAndProfessionalId(@Param("type") FeedbackType type, @Param("professionalId") Long professionalId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.feedbackType = :type AND f.professional.id IN :professionalIds")
    Double calculateAverageRatingForProfessionalIds(@Param("type") FeedbackType type, @Param("professionalIds") List<Long> professionalIds);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.feedbackType = :type AND f.professional.id IN :professionalIds")
    Long countByFeedbackTypeAndProfessionalIds(@Param("type") FeedbackType type, @Param("professionalIds") List<Long> professionalIds);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.feedbackType = :type AND f.professional.role = :role")
    Double calculateAverageRatingForRole(@Param("type") FeedbackType type, @Param("role") Role role);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.feedbackType = :type AND f.professional.role = :role")
    Long countByFeedbackTypeAndProfessionalRole(@Param("type") FeedbackType type, @Param("role") Role role);
}
