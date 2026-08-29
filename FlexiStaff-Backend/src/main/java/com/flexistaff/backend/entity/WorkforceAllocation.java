package com.flexistaff.backend.entity;

import com.flexistaff.backend.entity.enums.AllocationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "workforce_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkforceAllocation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professional_id", nullable = false)
    private User professional;

    @Column(name = "role_in_project")
    private String roleInProject; // e.g. "Senior AI Architect", "Backend Lead"

    private Integer allocatedHoursPerWeek;

    private BigDecimal billableRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AllocationStatus status;
}
