# =============================================================================
# FlexiStaff Fullstack Production Dockerfile for Render
# Builds React Frontend (Vite) + Spring Boot Backend into a unified web service
# Tuned for Render Free Tier (512MB RAM cap)
# =============================================================================

# -----------------------------------------------------------------------------
# 1. Frontend Build Stage (Node.js 20)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-build
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
ENV VITE_API_BASE_URL=/api/v1
RUN npm run build

# -----------------------------------------------------------------------------
# 2. Backend Build Stage (Maven + OpenJDK 21)
# -----------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

ENV MAVEN_OPTS="-Xmx384m -XX:+UseSerialGC -Dorg.slf4j.simpleLogger.defaultLogLevel=warn"

COPY Backend/pom.xml .
RUN mvn dependency:go-offline -B || true

COPY Backend/src ./src

# Copy built React frontend assets into Spring Boot's static resources folder
COPY --from=frontend-build /frontend/dist ./src/main/resources/static

RUN mvn clean package -DskipTests -Dmaven.compiler.fork=false

# -----------------------------------------------------------------------------
# 3. Runtime Stage (Lightweight JRE 21 Alpine)
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --chown=appuser:appgroup --from=build /app/target/*.jar app.jar
USER appuser

ENV PORT=8080
EXPOSE ${PORT}

ENTRYPOINT ["sh", "-c", "java -Xmx300m -Xms128m -XX:+UseSerialGC -Dserver.port=${PORT:-8080} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
