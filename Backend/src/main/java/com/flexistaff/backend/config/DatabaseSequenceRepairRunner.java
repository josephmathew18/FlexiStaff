package com.flexistaff.backend.config;

import com.flexistaff.backend.entity.*;
import com.flexistaff.backend.entity.enums.MilestoneStatus;
import com.flexistaff.backend.entity.enums.ProjectStatus;
import com.flexistaff.backend.entity.enums.Role;
import com.flexistaff.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.time.LocalDate;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class DatabaseSequenceRepairRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final HrManagerRepository hrManagerRepository;
    private final PartnerCompanyRepository partnerCompanyRepository;
    private final FreelancerRepository freelancerRepository;
    private final MilestoneRepository milestoneRepository;

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

        // Ensure core dataset exists if projects table is empty
        try {
            if (projectRepository.count() == 0) {
                log.info("Projects table is empty. Seeding core real dataset...");
                seedCoreDataset();
            }
        } catch (Exception ex) {
            log.debug("Notice while checking core dataset: {}", ex.getMessage());
        }
    }

    private void seedCoreDataset() {
        String defaultHash = "$2a$10$EeeObKb2iTHwLcjaedXZfeCNGaeoA3V/kskUifpvikKeJidrtOV22"; // Password@123

        // 1. Client Mathew
        User clientUser = userRepository.findByEmailIgnoreCase("tedz@gmail.com").orElseGet(() -> {
            User u = User.builder().email("tedz@gmail.com").password(defaultHash).fullName("mathew").role(Role.ROLE_CLIENT).active(true).build();
            return userRepository.save(u);
        });
        if (!clientRepository.existsByEmailIgnoreCase("tedz@gmail.com")) {
            clientRepository.save(Client.builder().name("mathew").companyName("tedz").email("tedz@gmail.com").phone("8787544412").password(defaultHash).industry("Enterprise Software & Services").tier("Enterprise Client").location("India").status("Active").user(clientUser).build());
        }

        // 2. HR Manager Thomas Mathew
        User managerUser = userRepository.findByEmailIgnoreCase("thomas@flexistaff.com").orElseGet(() -> {
            User u = User.builder().email("thomas@flexistaff.com").password(defaultHash).fullName("Thomas Mathew").role(Role.ROLE_MANAGER).active(true).build();
            return userRepository.save(u);
        });
        if (hrManagerRepository.findByEmailIgnoreCase("thomas@flexistaff.com").isEmpty()) {
            hrManagerRepository.save(HrManager.builder().name("Thomas Mathew").email("thomas@flexistaff.com").phone("+91 98765 43210").employeeId("22").jobTitle("HR Manager").department("Human Resources").experience("8+ Years").status("Active").joinDate("2026-10-15").user(managerUser).build());
        }

        // 3. Partner Company Yendoz
        User partnerUser = userRepository.findByEmailIgnoreCase("partner@gmail.com").orElseGet(() -> {
            User u = User.builder().email("partner@gmail.com").password(defaultHash).fullName("Joseph Mathew").role(Role.ROLE_PARTNER).active(true).build();
            return userRepository.save(u);
        });
        PartnerCompany yendoz = partnerCompanyRepository.findByEmailIgnoreCase("partner@gmail.com").orElseGet(() -> {
            return partnerCompanyRepository.save(PartnerCompany.builder().companyName("Yendoz").name("Yendoz").contactPerson("Joseph Mathew").email("partner@gmail.com").phone("7510311527").location("kochi").industry("IT Staffing & Consulting").tier("Strategic Partner").specialties("Web Development, Cloud Infrastructure, React.js, Node.js").status("Active").suppliedProfessionals(1).user(partnerUser).build());
        });

        // 4. Freelancers
        User mathewUser = userRepository.findByEmailIgnoreCase("mathew@flexistaff.com").orElseGet(() -> {
            User u = User.builder().email("mathew@flexistaff.com").password(defaultHash).fullName("Mathew Thomas").role(Role.ROLE_PROFESSIONAL).active(true).build();
            return userRepository.save(u);
        });
        if (freelancerRepository.findByEmailIgnoreCase("mathew@flexistaff.com").isEmpty()) {
            freelancerRepository.save(Freelancer.builder().name("Mathew Thomas").email("mathew@flexistaff.com").phone("2546435423").password(defaultHash).title("Employee").skills("React.js, Docker, Kubernetes, Node.js, TypeScript, TailwindCSS").bio("Software engineer specializing in modern React frontend.").experienceYears(4).hourlyRate(new BigDecimal("100.00")).availabilityStatus("Currently Assigned").status("Approved").partnerCompanyId(yendoz.getId()).build());
        }

        User princeUser = userRepository.findByEmailIgnoreCase("prince@flexistaff.com").orElseGet(() -> {
            User u = User.builder().email("prince@flexistaff.com").password(defaultHash).fullName("Prince Abraham").role(Role.ROLE_PROFESSIONAL).active(true).build();
            return userRepository.save(u);
        });
        if (freelancerRepository.findByEmailIgnoreCase("prince@flexistaff.com").isEmpty()) {
            freelancerRepository.save(Freelancer.builder().name("Prince Abraham").email("prince@flexistaff.com").phone("9874563210").password(defaultHash).title("Full stack developer").skills("Node.js, Tailwind CSS, UI/UX Design, React.js, Java").bio("Full stack developer delivering scalable web applications.").experienceYears(5).hourlyRate(new BigDecimal("1000.00")).availabilityStatus("Currently Assigned").status("Approved").build());
        }

        User adrianUser = userRepository.findByEmailIgnoreCase("adrian@flexistaff.com").orElseGet(() -> {
            User u = User.builder().email("adrian@flexistaff.com").password(defaultHash).fullName("Adrian John").role(Role.ROLE_PROFESSIONAL).active(false).build();
            return userRepository.save(u);
        });
        if (freelancerRepository.findByEmailIgnoreCase("adrian@flexistaff.com").isEmpty()) {
            freelancerRepository.save(Freelancer.builder().name("Adrian John").email("adrian@flexistaff.com").phone("9874563210").password(defaultHash).title("developer").skills("Python, Beta Testing, Data Analysis, Tailwind CSS, Node.js").bio("Software engineer and test analyst.").experienceYears(3).hourlyRate(new BigDecimal("2000.00")).availabilityStatus("Available").status("Rejected").build());
        }

        // 5. Projects
        Project p1 = Project.builder()
                .title("petrol pump")
                .description("Automated fuel dispensing telemetry and retail management ERP system.")
                .budget(new BigDecimal("50000.00"))
                .status(ProjectStatus.COMPLETED)
                .client(clientUser)
                .manager(managerUser)
                .workforceRequired(2)
                .requiredSkills("react.js, postgresql, python")
                .startDate(LocalDate.of(2026, 10, 20))
                .endDate(LocalDate.of(2027, 2, 1))
                .build();
        projectRepository.save(p1);

        Project p2 = Project.builder()
                .title("Automated Selenium & API Integration Platform (In Progress)")
                .description("End-to-end verification and testing suite updated.")
                .budget(new BigDecimal("80000.00"))
                .status(ProjectStatus.IN_PROGRESS)
                .client(clientUser)
                .manager(managerUser)
                .workforceRequired(2)
                .requiredSkills("Java, Spring Boot, React, Selenium")
                .startDate(LocalDate.of(2026, 10, 20))
                .endDate(LocalDate.of(2026, 12, 31))
                .build();
        projectRepository.save(p2);

        Project p3 = Project.builder()
                .title("Enterprise Cloud AI Modernization - Batch 1792407773")
                .description("Cross-functional staffing project for containerized AI pipelines.")
                .budget(new BigDecimal("125000.00"))
                .status(ProjectStatus.PENDING_APPROVAL)
                .client(clientUser)
                .manager(managerUser)
                .workforceRequired(4)
                .requiredSkills("Kubernetes, Spring Boot, PyTorch, React")
                .startDate(LocalDate.of(2026, 11, 1))
                .endDate(LocalDate.of(2027, 4, 30))
                .build();
        projectRepository.save(p3);

        log.info("Core real dataset successfully seeded: 3 projects, 1 partner, 1 manager, 3 freelancers.");
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
