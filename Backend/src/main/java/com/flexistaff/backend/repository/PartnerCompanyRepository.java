package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.PartnerCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PartnerCompanyRepository extends JpaRepository<PartnerCompany, Long> {

    Optional<PartnerCompany> findByEmailIgnoreCase(String email);

    Optional<PartnerCompany> findByUserId(Long userId);

    boolean existsByEmailIgnoreCase(String email);
}
