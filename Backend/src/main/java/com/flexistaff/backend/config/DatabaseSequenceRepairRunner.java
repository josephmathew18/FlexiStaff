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
                "freelancers",
                "client_profiles",
                "professional_profiles",
                "projects",
                "milestones",
                "workforce_allocations"
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
    }
}
