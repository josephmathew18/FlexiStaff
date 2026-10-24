package com.flexistaff.backend.config;

import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.repository.ProjectRepository;
import com.flexistaff.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class DatabaseSequenceRepairRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Override
    public void run(String... args) {
        try {
            repairDatabaseSequences();
        } catch (Throwable t) {
            log.warn("Database repair runner completed with notice: {}", t.getMessage());
        }
    }

    public void repairDatabaseSequences() {
        boolean isPostgres = false;
        try (Connection conn = dataSource.getConnection()) {
            String dbProduct = conn.getMetaData().getDatabaseProductName();
            isPostgres = dbProduct != null && dbProduct.toLowerCase().contains("postgres");
            log.info("Detected database engine: {}", dbProduct);
        } catch (Exception e) {
            log.debug("Notice inspecting database metadata: {}", e.getMessage());
        }

        if (isPostgres) {
            repairPostgresSequences();
        }

        // Schema constraint and column updates (isolated safe execution)
        safeExecute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        safeExecute("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CLIENT', 'ROLE_PROFESSIONAL', 'ROLE_PARTNER'))");
        safeExecute("ALTER TABLE freelancers ALTER COLUMN phone TYPE VARCHAR(50)");
        safeExecute("ALTER TABLE clients ALTER COLUMN phone TYPE VARCHAR(50)");
        safeExecute("ALTER TABLE client_profiles ALTER COLUMN contact_phone TYPE VARCHAR(50)");
        safeExecute("ALTER TABLE users ALTER COLUMN profile_pic TYPE TEXT");
        safeExecute("ALTER TABLE client_profiles ALTER COLUMN logo_url TYPE TEXT");

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

    private void repairPostgresSequences() {
        log.info("Synchronizing PostgreSQL table sequences...");

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
                String seqName = null;
                try {
                    seqName = jdbcTemplate.queryForObject("SELECT pg_get_serial_sequence(?, 'id')", String.class, table);
                } catch (Exception ignored) {
                }

                if (seqName == null || seqName.trim().isEmpty()) {
                    seqName = table + "_id_seq";
                }

                Long maxId = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(id), 0) FROM " + table, Long.class);
                if (maxId == null) maxId = 0L;

                long targetVal = maxId > 0 ? maxId : 1;
                boolean isCalled = maxId > 0;

                jdbcTemplate.execute("SELECT setval('" + seqName + "', " + targetVal + ", " + isCalled + ")");
                log.info("Synchronized PostgreSQL sequence for table '{}' to {}", table, targetVal);
            } catch (Exception e) {
                log.debug("Sequence notice for table '{}': {}", table, e.getMessage());
            }
        }
    }

    private void safeExecute(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception e) {
            log.debug("Notice executing '{}': {}", sql, e.getMessage());
        }
    }
}
