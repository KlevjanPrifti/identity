ARG KEYCLOAK_VERSION=26.0.7

############################################
# Stage 1: Build Keycloakify Theme JAR
############################################
FROM node:20-alpine AS keycloakify_jar_builder

# Install JDK + Maven
RUN apk update && \
    apk add --no-cache openjdk17-jdk maven

WORKDIR /opt/app

# Install deps with caching optimizations
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build theme
COPY . .
RUN pnpm build-keycloak-theme



############################################
# Stage 2: Build Email SPI JAR
############################################
FROM maven:3.9-eclipse-temurin-21 AS email_spi_builder

WORKDIR /opt/email-spi
COPY java-extended/pom.xml .
COPY java-extended/src ./src

RUN mvn clean package -q -DskipTests



############################################
# Stage 3: Build Keycloak server with SPIs
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS builder

WORKDIR /opt/keycloak

# Copy theme JAR into Keycloak providers
COPY --from=keycloakify_jar_builder /opt/app/dist_keycloak/*.jar /opt/keycloak/providers/

# Copy Email SPI
COPY --from=email_spi_builder /opt/email-spi/target/keycloak-email-spi-*.jar /opt/keycloak/providers/

# Default production values
ENV KC_DB=postgres
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# CRITICAL FIX: Correct environment variable name
# Was: KC_SPI_EMAIL_PROVIDER=custom-email-template (WRONG!)
# Should be: KC_SPI_EMAIL_TEMPLATE_PROVIDER=custom-email-template
ENV KC_SPI_EMAIL_TEMPLATE_PROVIDER=custom-email-template

# Optional: Enable debug logging for the custom provider
ENV KC_LOG_LEVEL=INFO,com.example.keycloak.email:DEBUG

# Build the optimized server image
RUN /opt/keycloak/bin/kc.sh build



############################################
# Stage 4: Runtime Image
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}

WORKDIR /opt/keycloak

# Copy built Keycloak instance from builder
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Runtime DB + server configs
ENV KC_DB=postgres
ENV KC_DB_POOL_INITIAL_SIZE=50
ENV KC_DB_POOL_MIN_SIZE=50
ENV KC_DB_POOL_MAX_SIZE=50
ENV QUARKUS_TRANSACTION_MANAGER_ENABLE_RECOVERY=true

# Hostname defaults
ENV KC_HOSTNAME=localhost
ENV KC_HTTP_ENABLED=true

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health/ready || exit 1

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]