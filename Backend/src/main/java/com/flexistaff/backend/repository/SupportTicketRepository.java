package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findAllByOrderByCreatedAtDesc();

    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<SupportTicket> findByUserRoleOrderByCreatedAtDesc(String userRole);

    List<SupportTicket> findByStatusOrderByCreatedAtDesc(String status);
}
