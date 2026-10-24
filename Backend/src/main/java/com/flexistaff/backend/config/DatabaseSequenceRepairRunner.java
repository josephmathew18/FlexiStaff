package com.flexistaff.backend.config;

import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.repository.ProjectRepository;
import com.flexistaff.backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class DatabaseSequenceRepairRunner implements CommandLineRunner {

    @PersistenceContext
    private EntityManager entityManager;

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Override
    @Transactional
    public void run(String... args) {
        repairDatabaseSequences();
    }

    @Transactional
    public void repairDatabaseSequences() {
        log.info("Checking and repairing database sequences and initial data...");

        List<String> tables = List.of(
                "users",
                "clients",
                "partner_companies",
                "freelancers",
                "client_profiles",
                "professional_profiles",
                "projects",
                "milestones",
                "workforce_allocations",
                "hr_managers",
                "feedback",
                "payments"
        );

        for (String table : tables) {
            try {
                // 1. Resolve PostgreSQL sequence name using pg_get_serial_sequence
                Object seqNameObj = entityManager.createNativeQuery(
                        "SELECT pg_get_serial_sequence('" + table + "', 'id')"
                ).getSingleResult();

                String seqName = (seqNameObj != null) ? seqNameObj.toString() : null;

                if (seqName == null || seqName.trim().isEmpty()) {
                    seqName = table + "_id_seq";
                }

                // 2. Obtain current max ID from table
                Object maxIdObj = entityManager.createNativeQuery(
                        "SELECT COALESCE(MAX(id), 0) FROM " + table
                ).getSingleResult();

                long maxId = 0L;
                if (maxIdObj instanceof Number) {
                    maxId = ((Number) maxIdObj).longValue();
                }

                // 3. Set PostgreSQL sequence val to MAX(id)
                long targetVal = maxId > 0 ? maxId : 1;
                boolean isCalled = maxId > 0;

                String resetSql = "SELECT setval('" + seqName + "', " + targetVal + ", " + isCalled + ")";
                entityManager.createNativeQuery(resetSql).getSingleResult();

                log.info("Successfully repaired sequence for table '{}' (seq: '{}', maxId: {}, targetVal: {})",
                        table, seqName, maxId, targetVal);
            } catch (Exception e) {
                log.debug("Sequence synchronization notice for table '{}': {}", table, e.getMessage());
            }
        }

        // Schema constraint and column updates (isolated so errors on one do not prevent others)
        safeExecuteQuery("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        safeExecuteQuery("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CLIENT', 'ROLE_PROFESSIONAL', 'ROLE_PARTNER'))");
        safeExecuteQuery("ALTER TABLE freelancers ALTER COLUMN phone TYPE VARCHAR(50)");
        safeExecuteQuery("ALTER TABLE clients ALTER COLUMN phone TYPE VARCHAR(50)");
        safeExecuteQuery("ALTER TABLE client_profiles ALTER COLUMN contact_phone TYPE VARCHAR(50)");
        safeExecuteQuery("ALTER TABLE users ALTER COLUMN profile_pic TYPE TEXT");
        safeExecuteQuery("ALTER TABLE client_profiles ALTER COLUMN logo_url TYPE TEXT");

        // Seed / Verify Admin user
        try {
            String adminEmail = "admin@flexistaff.com";
            String adminPasswordHash = "$2a$10$6eBhtAAPEY1Gq5UZhZWuK.XbGLJsbJo63rZZOjeo89FXJY4iG1AuO"; // admin123
            userRepository.findByEmailIgnoreCase(adminEmail).ifPresentOrElse(admin -> {
                admin.setPassword(adminPasswordHash);
                admin.setRole(Role.ROLE_ADMIN);
                admin.setActive(true);
                userRepository.save(admin);
                log.info("Verified system administrator credentials: {}", adminEmail);
            }, () -> {
                User admin = User.builder()
                        .email(adminEmail)
                        .password(adminPasswordHash)
                        .fullName("System Administrator")
                        .role(Role.ROLE_ADMIN)
                        .active(true)
                        .build();
                userRepository.save(admin);
                log.info("Initialized system administrator user: {}", adminEmail);
            });
        } catch (Exception ex) {
            log.debug("Notice while checking admin user: {}", ex.getMessage());
        }

        // Seed / Verify Client Mathew (tedz@gmail.com)
        try {
            String clientEmail = "tedz@gmail.com";
            String clientPasswordHash = "$2a$10$EeeObKb2iTHwLcjaedXZfeCNGaeoA3V/kskUifpvikKeJidrtOV22"; // Password@123
            userRepository.findByEmailIgnoreCase(clientEmail).ifPresentOrElse(clientUser -> {
                clientUser.setPassword(clientPasswordHash);
                clientUser.setActive(true);
                userRepository.save(clientUser);
                log.info("Verified client Mathew credentials: {}", clientEmail);
            }, () -> {
                User clientUser = User.builder()
                        .email(clientEmail)
                        .password(clientPasswordHash)
                        .fullName("Mathew")
                        .role(Role.ROLE_CLIENT)
                        .active(true)
                        .build();
                userRepository.save(clientUser);
                log.info("Initialized default client user: {}", clientEmail);
            });
        } catch (Exception ex) {
            log.debug("Notice while checking client user: {}", ex.getMessage());
        }

        // Verify default project budget
        try {
            projectRepository.findById(1L).ifPresent(p -> {
                if (p.getBudget() == null) {
                    p.setBudget(new BigDecimal("50000.00"));
                    projectRepository.save(p);
                    log.info("Set default budget for Project 1: 50000.00");
                }
            });
        } catch (Exception ex) {
            log.debug("Notice while checking project 1 budget: {}", ex.getMessage());
        }
    }

    private void safeExecuteQuery(String sql) {
        try {
            entityManager.createNativeQuery(sql).executeUpdate();
        } catch (Exception e) {
            log.debug("Notice executing '{}': {}", sql, e.getMessage());
        }
    }
}
