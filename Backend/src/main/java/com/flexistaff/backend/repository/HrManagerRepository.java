package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.HrManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HrManagerRepository extends JpaRepository<HrManager, Long> {

    Optional<HrManager> findByUserId(Long userId);

    Optional<HrManager> findByEmailIgnoreCase(String email);

    Boolean existsByUserId(Long userId);

    Boolean existsByEmailIgnoreCase(String email);
}
