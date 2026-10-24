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

/**
 * Custom DataSource Configuration supporting Render PostgreSQL DATABASE_URL
 * and automatic graceful fallback to embedded in-memory H2 (PostgreSQL compatibility mode)
 * when PostgreSQL is unreachable or not yet configured.
 */
@Slf4j
@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/flexistaff}")
    private String configuredUrl;

    @Value("${spring.datasource.username:postgres}")
    private String configuredUsername;

    @Value("${spring.datasource.password:4272}")
    private String configuredPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            databaseUrl = System.getenv("SPRING_DATASOURCE_URL");
        }

        HikariConfig config = new HikariConfig();
        boolean hasRemoteUrl = false;

        if (databaseUrl != null && !databaseUrl.isBlank() && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            try {
                log.info("Render DATABASE_URL environment variable detected. Converting to JDBC URL...");
                URI dbUri = new URI(databaseUrl);
                String userInfo = dbUri.getUserInfo();
                String username = null;
                String password = null;
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

                String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s?sslmode=require", dbUri.getHost(), port, path);
                config.setJdbcUrl(jdbcUrl);
                if (username != null) config.setUsername(username);
                if (password != null) config.setPassword(password);
                config.setDriverClassName("org.postgresql.Driver");
                hasRemoteUrl = true;
                log.info("Successfully converted Render PostgreSQL URL to JDBC target: jdbc:postgresql://{}:{}/{}", dbUri.getHost(), port, path);
            } catch (Exception e) {
                log.error("Failed to parse DATABASE_URL: {}, falling back to standard datasource configuration", e.getMessage());
            }
        }

        if (!hasRemoteUrl) {
            config.setJdbcUrl(configuredUrl);
            config.setUsername(configuredUsername);
            config.setPassword(configuredPassword);
            config.setDriverClassName("org.postgresql.Driver");
        }

        // Tuned for 512MB RAM environment
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(8000); // 8s
        config.setMaxLifetime(600000);
        config.setInitializationFailTimeout(1500); // Fail fast in 1.5s if host is unreachable so fallback triggers immediately

        HikariDataSource primaryDs = null;
        try {
            log.info("Attempting to connect to primary DataSource: {}", config.getJdbcUrl());
            primaryDs = new HikariDataSource(config);
            try (Connection conn = primaryDs.getConnection()) {
                log.info("Successfully established connection to primary database: {}", config.getJdbcUrl());
            }
            return primaryDs;
        } catch (Exception e) {
            if (primaryDs != null) {
                try {
                    primaryDs.close();
                } catch (Exception ignored) {
                }
            }
            log.warn("Could not connect to primary database ({}): {}. Initiating automatic fallback to embedded in-memory H2 database (PostgreSQL mode)...",
                    config.getJdbcUrl(), e.getMessage());

            HikariConfig h2Config = new HikariConfig();
            h2Config.setJdbcUrl("jdbc:h2:mem:flexistaff;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERINGS=HIGH");
            h2Config.setDriverClassName("org.h2.Driver");
            h2Config.setUsername("sa");
            h2Config.setPassword("");
            h2Config.setMaximumPoolSize(5);
            h2Config.setMinimumIdle(1);
            h2Config.setIdleTimeout(300000);
            h2Config.setConnectionTimeout(10000);
            h2Config.setMaxLifetime(600000);

            log.info("Embedded H2 in-memory DataSource successfully initialized.");
            return new HikariDataSource(h2Config);
        }
    }
}
