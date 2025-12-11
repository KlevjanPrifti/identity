ARG KEYCLOAK_VERSION=26.4.7

############################################
# Stage 1: Build Keycloakify Theme JAR
############################################
FROM node:20-alpine AS keycloakify_jar_builder

# Install JDK + Maven
RUN apk update && apk add --no-cache openjdk17-jdk maven curl bash

WORKDIR /opt/app

# Install deps with caching optimizations
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build theme
COPY . .
RUN pnpm build-keycloak-theme

############################################
# Stage 2: Build Keycloak server with SPIs
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS builder

WORKDIR /opt/keycloak

# Copy theme JAR into Keycloak providers
COPY --from=keycloakify_jar_builder /opt/app/dist_keycloak/*.jar /opt/keycloak/providers/

# Build-time defaults (can be overridden)
ARG KC_DB_URL
ARG KC_DB_USERNAME
ARG KC_DB_PASSWORD
ARG KC_HTTP_ENABLED
ARG KC_PROXY
ARG KC_HOSTNAME
ARG KC_HEALTH_ENABLED
ARG KC_METRICS_ENABLED

ENV KC_DB_URL=${KC_DB_URL}
ENV KC_DB_USERNAME=${KC_DB_USERNAME}
ENV KC_DB_PASSWORD=${KC_DB_PASSWORD}
ENV KC_HTTP_ENABLED=${KC_HTTP_ENABLED}
ENV KC_PROXY=${KC_PROXY}
ENV KC_HOSTNAME=${KC_HOSTNAME}
ENV KC_HEALTH_ENABLED=${KC_HEALTH_ENABLED}
ENV KC_METRICS_ENABLED=${KC_METRICS_ENABLED}

# Build the optimized server image
RUN /opt/keycloak/bin/kc.sh build

############################################
# Stage 3: Runtime Image
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}

WORKDIR /opt/keycloak

# Copy built Keycloak instance from builder
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Runtime configuration from environment
ENV KC_DB_URL=${KC_DB_URL}
ENV KC_DB_USERNAME=${KC_DB_USERNAME}
ENV KC_DB_PASSWORD=${KC_DB_PASSWORD}
ENV KC_HTTP_ENABLED=${KC_HTTP_ENABLED:-true}
ENV KC_PROXY=${KC_PROXY:-edge}
ENV KC_HOSTNAME=${KC_HOSTNAME}
ENV KC_HEALTH_ENABLED=${KC_HEALTH_ENABLED:-true}
ENV KC_METRICS_ENABLED=${KC_METRICS_ENABLED:-true}
ENV KC_BOOTSTRAP_ADMIN_USERNAME=${KC_BOOTSTRAP_ADMIN_USERNAME}
ENV KC_BOOTSTRAP_ADMIN_PASSWORD=${KC_BOOTSTRAP_ADMIN_PASSWORD}
ENV KC_DB_POOL_INITIAL_SIZE=${KC_DB_POOL_INITIAL_SIZE:-50}
ENV KC_DB_POOL_MIN_SIZE=${KC_DB_POOL_MIN_SIZE:-50}
ENV KC_DB_POOL_MAX_SIZE=${KC_DB_POOL_MAX_SIZE:-50}
ENV QUARKUS_TRANSACTION_MANAGER_ENABLE_RECOVERY=${QUARKUS_TRANSACTION_MANAGER_ENABLE_RECOVERY:-true}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${KEYCLOAK_PORT:-8080}/health/ready || exit 1

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--import-realm"]
