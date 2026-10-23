# =============================================================================
# FlexiStaff Backend - Production Dockerfile for Render (Root Context)
# Specially optimized for Render Free Tier (512MB RAM cap)
# =============================================================================

# -----------------------------------------------------------------------------
# 1. Build Stage (Maven + OpenJDK 21)
# -----------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cap Maven JVM memory to strictly prevent OOM kill on 512MB container
ENV MAVEN_OPTS="-Xmx384m -XX:+UseSerialGC -Dorg.slf4j.simpleLogger.defaultLogLevel=warn"

# Copy Maven POM and pre-fetch dependencies layer
COPY Backend/pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build production JAR (skipping unit tests)
COPY Backend/src ./src
RUN mvn clean package -DskipTests -Dmaven.compiler.fork=false

# -----------------------------------------------------------------------------
# 2. Runtime Stage (Lightweight JRE 21 Alpine)
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy executable jar from build stage with correct permissions
COPY --chown=appuser:appgroup --from=build /app/target/*.jar app.jar

USER appuser

# Render dynamically injects PORT (default 8080 fallback)
ENV PORT=8080
EXPOSE ${PORT}

# JVM tuned for 512MB Render free tier instance (Max 300MB heap, low-overhead SerialGC)
ENTRYPOINT ["sh", "-c", "java -Xmx300m -Xms128m -XX:+UseSerialGC -Dserver.port=${PORT:-8080} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
