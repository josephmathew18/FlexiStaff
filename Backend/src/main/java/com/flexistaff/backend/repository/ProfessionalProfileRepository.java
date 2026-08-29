package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.ProfessionalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfessionalProfileRepository extends JpaRepository<ProfessionalProfile, Long> {

    Optional<ProfessionalProfile> findByUserId(Long userId);

    List<ProfessionalProfile> findByAvailabilityStatus(String availabilityStatus);
}
