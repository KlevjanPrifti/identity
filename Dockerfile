ARG KEYCLOAK_VERSION=26.4.7

############################################
# Stage 1: Build Keycloakify Theme JAR
############################################
FROM node:20-alpine AS keycloakify_jar_builder

RUN apk update && apk add --no-cache openjdk17-jdk maven bash curl

WORKDIR /opt/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build-keycloak-theme

############################################
# Stage 2: Build Keycloak (optimized)
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS builder

WORKDIR /opt/keycloak

# Copy custom theme provider JAR
COPY --from=keycloakify_jar_builder /opt/app/dist_keycloak/*.jar /opt/keycloak/providers/

# Build-time config (do NOT include secrets like DB password)
ENV KC_DB=postgres
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_HTTP_ENABLED=true
ENV KC_PROXY=edge

# Build optimized Keycloak with DB vendor
RUN /opt/keycloak/bin/kc.sh build --db=postgres

############################################
# Stage 3: Runtime image
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}

WORKDIR /opt/keycloak

# Copy optimized Keycloak from builder
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Runtime environment — secrets come from Docker Compose
ENV KC_DB_URL="jdbc:postgresql://postgres:5432/${POSTGRES_DB}" \
    KC_DB_USERNAME="${POSTGRES_USER}" \
    KC_DB_PASSWORD="${POSTGRES_PASSWORD}" \
    KC_BOOTSTRAP_ADMIN_USERNAME="${KEYCLOAK_ADMIN}" \
    KC_BOOTSTRAP_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD}" \
    KC_HOSTNAME="${KC_HOSTNAME}" \
    KC_HTTP_ENABLED=true \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=5 \
  CMD curl -f http://localhost:8080/health/ready || exit 1

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]
