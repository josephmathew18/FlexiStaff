package com.flexistaff.backend.repository;

import com.flexistaff.backend.entity.Project;
import com.flexistaff.backend.entity.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByClientId(Long clientId);

    List<Project> findByManagerId(Long managerId);

    List<Project> findByStatus(ProjectStatus status);

    long countByStatus(ProjectStatus status);
}
