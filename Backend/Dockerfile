# ==========================================
# 1. Build Stage (Maven + OpenJDK 21)
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build production JAR (skip unit tests for deployment)
RUN mvn clean package -DskipTests

# ==========================================
# 2. Production Runtime Stage (JRE 21 Alpine)
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Security: Run as a non-privileged user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy executable jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Default PORT fallback if not provided by Render
ENV PORT=8080
EXPOSE ${PORT}

# Start Spring Boot application binding to Render's dynamic PORT
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
