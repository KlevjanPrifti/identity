ARG KEYCLOAK_VERSION=26.4.7

############################################
# Stage 1: Build Keycloak theme JAR
############################################
FROM node:20-alpine AS keycloakify_jar_builder

# Install JDK, Maven, and bash
RUN apk update && apk add --no-cache openjdk17-jdk maven bash curl

WORKDIR /opt/app

# Install Node dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy theme source and build
COPY . .
RUN pnpm build-keycloak-theme

############################################
# Stage 2: Build optimized Keycloak with theme
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS builder

WORKDIR /opt/keycloak

# Copy custom theme provider JAR
COPY --from=keycloakify_jar_builder /opt/app/dist_keycloak/*.jar /opt/keycloak/providers/

# Build-time config
ENV KC_DB=postgres
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_HTTP_ENABLED=true
ENV KC_PROXY=edge
ENV KC_CLUSTER=local
ENV KC_CACHE=local

# Build optimized Keycloak
RUN /opt/keycloak/bin/kc.sh build

############################################
# Stage 3: Runtime image
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}

WORKDIR /opt/keycloak

# Copy built Keycloak from builder
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Runtime environment — values injected via Docker Compose
ENV KC_DB=postgres
ENV KC_HTTP_ENABLED=true
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_PROXY=edge
ENV KC_CLUSTER=local
ENV KC_CACHE=local

# Database pool settings
ENV KC_DB_POOL_INITIAL_SIZE=50
ENV KC_DB_POOL_MIN_SIZE=50
ENV KC_DB_POOL_MAX_SIZE=50
ENV QUARKUS_TRANSACTION_MANAGER_ENABLE_RECOVERY=true

# Hostname configurable via env
ENV KC_HOSTNAME=${KC_HOSTNAME:-localhost}
ENV KC_HOSTNAME_STRICT=false

# Recommended production entrypoint
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start"]
