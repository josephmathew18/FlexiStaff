package com.flexistaff.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hr_managers", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HrManager extends BaseEntity {

    @Column(name = "employee_id")
    private String employeeId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "job_title")
    private String jobTitle;

    private String department;

    private String experience;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String dob;

    private String address;

    @Column(columnDefinition = "TEXT")
    private String avatar;

    @Builder.Default
    @Column(nullable = false)
    private String status = "Active";

    @Column(name = "join_date")
    private String joinDate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
