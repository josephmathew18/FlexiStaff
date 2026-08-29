package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.Milestone;
import com.flexistaff.backend.entity.enums.MilestoneStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByProjectId(Long projectId);

    List<Milestone> findByProjectIdAndStatus(Long projectId, MilestoneStatus status);
}
