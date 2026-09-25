package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByEmail(String email);

    Boolean existsByEmail(String email);

    Optional<Client> findByUserId(Long userId);
}
