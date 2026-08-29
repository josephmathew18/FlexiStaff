package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.WorkforceAllocation;
import com.flexistaff.backend.entity.enums.AllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkforceAllocationRepository extends JpaRepository<WorkforceAllocation, Long> {

    List<WorkforceAllocation> findByProjectId(Long projectId);

    List<WorkforceAllocation> findByProfessionalId(Long professionalId);

    List<WorkforceAllocation> findByProfessionalIdAndStatus(Long professionalId, AllocationStatus status);
}
