# =============================================================================
# FlexiStaff Backend - Production Dockerfile for Render (Backend Context)
# Specially optimized for Render Free Tier (512MB RAM cap)
# =============================================================================

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

ENV MAVEN_OPTS="-Xmx384m -XX:+UseSerialGC -Dorg.slf4j.simpleLogger.defaultLogLevel=warn"

COPY pom.xml .
RUN mvn dependency:go-offline -B || true

COPY src ./src
RUN mvn clean package -DskipTests -Dmaven.compiler.fork=false

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --chown=appuser:appgroup --from=build /app/target/*.jar app.jar
USER appuser

ENV PORT=8080
EXPOSE ${PORT}

ENTRYPOINT ["sh", "-c", "java -Xmx300m -Xms128m -XX:+UseSerialGC -Dserver.port=${PORT:-8080} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
