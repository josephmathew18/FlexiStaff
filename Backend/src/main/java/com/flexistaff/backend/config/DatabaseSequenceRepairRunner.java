package com.flexistaff.backend.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Slf4j
public class DatabaseSequenceRepairRunner implements CommandLineRunner {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
        repairDatabaseSequences();
    }

    @Transactional
    public void repairDatabaseSequences() {
        log.info("Checking and repairing PostgreSQL sequences for user and entity tables...");

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
                "hr_managers"
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

                log.info("Successfully repaired PostgreSQL sequence for table '{}' (seq: '{}', maxId: {}, targetVal: {})",
                        table, seqName, maxId, targetVal);
            } catch (Exception e) {
                log.debug("Sequence synchronization notice for table '{}': {}", table, e.getMessage());
            }
        }

        try {
            entityManager.createNativeQuery("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CLIENT', 'ROLE_PROFESSIONAL', 'ROLE_PARTNER'))").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE freelancers ALTER COLUMN phone TYPE VARCHAR(50)").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE clients ALTER COLUMN phone TYPE VARCHAR(50)").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE client_profiles ALTER COLUMN contact_phone TYPE VARCHAR(50)").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE client_profiles ALTER COLUMN logo_url TYPE TEXT").executeUpdate();
            log.info("Successfully updated users_role_check constraint and column types");

            // Ensure Admin user exists with proper email and password
            String adminPasswordHash = "$2a$10$6eBhtAAPEY1Gq5UZhZWuK.XbGLJsbJo63rZZOjeo89FXJY4iG1AuO"; // admin123
            entityManager.createNativeQuery(
                "INSERT INTO users (id, full_name, email, password, role, active, created_at, updated_at) " +
                "VALUES (4, 'System Administrator', 'admin@flexistaff.com', '" + adminPasswordHash + "', 'ROLE_ADMIN', true, NOW(), NOW()) " +
                "ON CONFLICT (id) DO UPDATE SET email = 'admin@flexistaff.com', password = '" + adminPasswordHash + "', active = true, role = 'ROLE_ADMIN'"
            ).executeUpdate();
            log.info("Successfully ensured system administrator account (admin@flexistaff.com)");
        } catch (Exception ex) {
            log.debug("Role check constraint sync notice: {}", ex.getMessage());
        }
    }
}
