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
# Stage 3: Build Keycloak server with SPIs
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS builder

WORKDIR /opt/keycloak

# Copy theme JAR into Keycloak providers
COPY --from=keycloakify_jar_builder /opt/app/dist_keycloak/*.jar /opt/keycloak/providers/

# Default production values
ENV KC_DB=postgres
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

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
CMD ["start", "--optimized", "--import-realm"]