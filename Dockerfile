ARG KEYCLOAK_VERSION=26.4.7

############################################
# Stage 1: Build Keycloak theme JAR
############################################
FROM node:20-alpine AS keycloakify_jar_builder

RUN apk update && apk add --no-cache openjdk17-jdk maven bash curl

WORKDIR /opt/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build-keycloak-theme

############################################
# Stage 2: Build Keycloak server with theme
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS builder

WORKDIR /opt/keycloak

COPY --from=keycloakify_jar_builder /opt/app/dist_keycloak/*.jar /opt/keycloak/providers/

ENV KC_DB=postgres
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_HTTP_ENABLED=true
ENV KC_PROXY=edge

RUN /opt/keycloak/bin/kc.sh build

############################################
# Stage 3: Runtime image
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}

WORKDIR /opt/keycloak

COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Runtime environment (secrets via Docker Compose)
ENV KC_DB=postgres
ENV KC_HTTP_ENABLED=true
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_PROXY=edge

# Database pool settings
ENV KC_DB_POOL_INITIAL_SIZE=50
ENV KC_DB_POOL_MIN_SIZE=50
ENV KC_DB_POOL_MAX_SIZE=50
ENV QUARKUS_TRANSACTION_MANAGER_ENABLE_RECOVERY=true

# Hostname configurable via env
ENV KC_HOSTNAME=${KC_HOSTNAME:-localhost}

# Recommended production entrypoint with optimized startup
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start"]
