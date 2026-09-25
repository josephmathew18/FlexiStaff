package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.Freelancer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FreelancerRepository extends JpaRepository<Freelancer, Long> {

    Optional<Freelancer> findByEmail(String email);

    Optional<Freelancer> findByEmailIgnoreCase(String email);

    Boolean existsByEmail(String email);

    Boolean existsByEmailIgnoreCase(String email);

    Optional<Freelancer> findByUserId(Long userId);

    List<Freelancer> findByAvailabilityStatus(String availabilityStatus);
}
