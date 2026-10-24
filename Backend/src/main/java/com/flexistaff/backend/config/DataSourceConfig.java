package com.flexistaff.backend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.sql.Connection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Enterprise DataSource Configuration supporting:
 * 1. Supabase PostgreSQL (Direct IPv6 connection + Supabase IPv4 Pooler auto-negotiation)
 * 2. Render DATABASE_URL & standard JDBC URLs
 * 3. Automatic graceful fallback to embedded in-memory H2 (PostgreSQL compatibility mode)
 */
@Slf4j
@Configuration
public class DataSourceConfig {

    private static final Pattern SUPABASE_HOST_PATTERN = Pattern.compile("db\\.([a-zA-Z0-9_-]+)\\.supabase\\.co", Pattern.CASE_INSENSITIVE);

    @Value("${spring.datasource.url:jdbc:postgresql://aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require}")
    private String configuredUrl;

    @Value("${spring.datasource.username:postgres.wrlpzqqxwsihupmeeios}")
    private String configuredUsername;

    @Value("${spring.datasource.password:josephthekkel2255}")
    private String configuredPassword;

    @Value("${app.supabase.pooler-host:aws-0-ap-northeast-2.pooler.supabase.com}")
    private String defaultPoolerHost;

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            databaseUrl = System.getenv("SPRING_DATASOURCE_URL");
        }

        String primaryJdbcUrl;
        String primaryUser;
        String primaryPassword;

        if (databaseUrl != null && !databaseUrl.isBlank() && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            try {
                log.info("DATABASE_URL environment variable detected. Converting to JDBC URL...");
                URI dbUri = new URI(databaseUrl);
                String userInfo = dbUri.getUserInfo();
                String username = configuredUsername;
                String password = configuredPassword;
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }

                int port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();
                String path = dbUri.getPath();
                if (path != null && path.startsWith("/")) {
                    path = path.substring(1);
                }
                if (path == null || path.isBlank()) {
                    path = "postgres";
                }

                String sslParam = (dbUri.getQuery() != null && dbUri.getQuery().contains("sslmode")) ? "" : "?sslmode=require";
                if (dbUri.getQuery() != null && !dbUri.getQuery().isBlank()) {
                    sslParam = "?" + dbUri.getQuery();
                }

                primaryJdbcUrl = String.format("jdbc:postgresql://%s:%d/%s%s", dbUri.getHost(), port, path, sslParam);
                primaryUser = username;
                primaryPassword = password;
                log.info("Converted DATABASE_URL to JDBC target: jdbc:postgresql://{}:{}/{}", dbUri.getHost(), port, path);
            } catch (Exception e) {
                log.error("Failed to parse DATABASE_URL: {}, using standard datasource configuration", e.getMessage());
                primaryJdbcUrl = configuredUrl;
                primaryUser = configuredUsername;
                primaryPassword = configuredPassword;
            }
        } else {
            primaryJdbcUrl = configuredUrl;
            primaryUser = configuredUsername;
            primaryPassword = configuredPassword;
        }

        // Auto-enforce SSL for Supabase or remote PostgreSQL if not already present
        if ((primaryJdbcUrl.contains("supabase.co") || primaryJdbcUrl.contains("supabase.com") || primaryJdbcUrl.contains("render.com"))
                && !primaryJdbcUrl.contains("sslmode=")) {
            primaryJdbcUrl += (primaryJdbcUrl.contains("?") ? "&" : "?") + "sslmode=require";
        }
        if ((primaryJdbcUrl.contains("pooler.supabase.com") || primaryJdbcUrl.contains(":6543"))
                && !primaryJdbcUrl.contains("prepareThreshold=")) {
            primaryJdbcUrl += (primaryJdbcUrl.contains("?") ? "&" : "?") + "prepareThreshold=0";
        }

        // 1. Attempt connection with Primary DataSource
        HikariDataSource primaryDs = tryCreateDataSource(primaryJdbcUrl, primaryUser, primaryPassword, "Primary DataSource");
        if (primaryDs != null) {
            return primaryDs;
        }

        // 2. Check for Supabase IPv4 Pooler Auto-Negotiation
        // Supabase direct host (db.[ref].supabase.co) resolves to IPv6 only.
        // On IPv4-only networks (Render free web services, standard ISPs), direct IPv6 fails.
        // We automatically attempt connecting via the Supabase Connection Pooler (Supavisor).
        Matcher supabaseMatcher = SUPABASE_HOST_PATTERN.matcher(primaryJdbcUrl);
        if (supabaseMatcher.find()) {
            String projectRef = supabaseMatcher.group(1);
            String poolerUser = primaryUser.contains(".") ? primaryUser : primaryUser + "." + projectRef;

            // Try port 6543 first (Transaction pooler - standard for Supabase cloud connections)
            String poolerTxUrl = String.format("jdbc:postgresql://%s:6543/postgres?sslmode=require&prepareThreshold=0", defaultPoolerHost);
            log.info("Direct Supabase host failed (likely IPv6 network limitation). Attempting connection via Supabase pooler ({}:6543) with user '{}'...",
                    defaultPoolerHost, poolerUser);

            HikariDataSource poolerTxDs = tryCreateDataSource(poolerTxUrl, poolerUser, primaryPassword, "Supabase Pooler Port 6543 DataSource");
            if (poolerTxDs != null) {
                log.info(">>> SUCCESS: Connected to Supabase PostgreSQL via port 6543!");
                return poolerTxDs;
            }

            // Also try port 5432 (Session pooler)
            String poolerUrl = String.format("jdbc:postgresql://%s:5432/postgres?sslmode=require&prepareThreshold=0", defaultPoolerHost);
            log.info("Attempting Supabase pooler on session port 5432...");
            HikariDataSource poolerDs = tryCreateDataSource(poolerUrl, poolerUser, primaryPassword, "Supabase IPv4 Pooler DataSource");
            if (poolerDs != null) {
                log.info(">>> SUCCESS: Connected to Supabase PostgreSQL via IPv4 connection pooler port 5432!");
                return poolerDs;
            }
        }

        // 2b. Attempt connection via default Supabase pooler port 6543
        String defaultPoolerUrl = "jdbc:postgresql://aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0";
        String defaultPoolerUser = "postgres.wrlpzqqxwsihupmeeios";
        String defaultPoolerPass = "josephthekkel2255";
        log.info("Attempting fallback connection to standard Supabase pooler: {}", defaultPoolerUrl);
        HikariDataSource fallbackSupabaseDs = tryCreateDataSource(defaultPoolerUrl, defaultPoolerUser, defaultPoolerPass, "Standard Supabase Pooler DataSource");
        if (fallbackSupabaseDs != null) {
            log.info(">>> SUCCESS: Connected to Supabase PostgreSQL via standard pooler!");
            return fallbackSupabaseDs;
        }

        // 3. Graceful Fallback to In-Memory H2 (PostgreSQL compatibility mode)
        log.warn("Could not connect to external PostgreSQL database. Initiating automatic graceful fallback to embedded in-memory H2 database (PostgreSQL mode)...");
        return createH2FallbackDataSource();
    }

    private HikariDataSource tryCreateDataSource(String jdbcUrl, String username, String password, String name) {
        if ((jdbcUrl.contains("6543") || jdbcUrl.contains("pooler.supabase.com")) && !jdbcUrl.contains("prepareThreshold=")) {
            jdbcUrl += (jdbcUrl.contains("?") ? "&" : "?") + "prepareThreshold=0";
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("org.postgresql.Driver");

        // Tuned for 512MB RAM environment & Supabase/PgBouncer pooler stability
        config.setPoolName("FlexiStaff-" + name.replaceAll("[^a-zA-Z0-9]", ""));
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setIdleTimeout(60000);              // 1 minute
        config.setMaxLifetime(180000);             // 3 minutes (replaces connections before Supabase pooler drops idle sockets)
        config.setConnectionTimeout(10000);         // 10s timeout
        config.setKeepaliveTime(25000);            // 25s keepalive ping prevents idle connection termination
        config.setConnectionTestQuery("SELECT 1");  // Proactively validates connection health before handing to Hibernate
        config.setValidationTimeout(3000);         // 3s validation timeout
        config.setInitializationFailTimeout(3000);  // Fail fast in 3s so alternatives/fallbacks trigger promptly

        HikariDataSource ds = null;
        try {
            log.info("Testing connection to {}: {}", name, jdbcUrl);
            ds = new HikariDataSource(config);
            try (Connection conn = ds.getConnection()) {
                log.info("Successfully established connection to {}: {}", name, jdbcUrl);
                return ds;
            }
        } catch (Exception e) {
            log.warn("Failed connection to {} ({}): {}", name, jdbcUrl, e.getMessage());
            if (ds != null) {
                try {
                    ds.close();
                } catch (Exception ignored) {
                }
            }
            return null;
        }
    }

    private HikariDataSource createH2FallbackDataSource() {
        HikariConfig h2Config = new HikariConfig();
        h2Config.setPoolName("FlexiStaff-H2Fallback");
        h2Config.setJdbcUrl("jdbc:h2:mem:flexistaff;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE");
        h2Config.setDriverClassName("org.h2.Driver");
        h2Config.setUsername("sa");
        h2Config.setPassword("");
        h2Config.setMaximumPoolSize(5);
        h2Config.setMinimumIdle(1);
        h2Config.setIdleTimeout(60000);
        h2Config.setConnectionTimeout(10000);
        h2Config.setMaxLifetime(180000);
        h2Config.setConnectionTestQuery("SELECT 1");

        log.info("Embedded H2 in-memory DataSource successfully initialized.");
        return new HikariDataSource(h2Config);
    }
}
