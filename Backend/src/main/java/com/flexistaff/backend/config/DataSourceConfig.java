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

/**
 * Custom DataSource Configuration to support Render PostgreSQL DATABASE_URL format
 * Automatically converts postgres:// or postgresql:// to valid JDBC URL with SSL.
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

        if (databaseUrl != null && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
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
                log.info("Successfully converted Render PostgreSQL URL to JDBC target: jdbc:postgresql://{}:{}/{}", dbUri.getHost(), port, path);
            } catch (Exception e) {
                log.error("Failed to parse DATABASE_URL: {}, falling back to standard datasource configuration", e.getMessage());
                config.setJdbcUrl(configuredUrl);
                config.setUsername(configuredUsername);
                config.setPassword(configuredPassword);
                config.setDriverClassName("org.postgresql.Driver");
            }
        } else {
            config.setJdbcUrl(configuredUrl);
            config.setUsername(configuredUsername);
            config.setPassword(configuredPassword);
            config.setDriverClassName("org.postgresql.Driver");
        }

        // Tuned for 512MB RAM environment
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(30000);
        config.setMaxLifetime(600000);

        return new HikariDataSource(config);
    }
}
