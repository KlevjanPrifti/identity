ARG KEYCLOAK_VERSION=26.4.7

############################################
# Stage 1: Build Keycloakify Theme JAR
############################################
FROM node:20-alpine AS keycloakify_jar_builder

RUN apk update && apk add --no-cache openjdk17-jdk maven curl bash

WORKDIR /opt/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build-keycloak-theme


############################################
# Stage 2: Build Keycloak (NO secrets)
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS builder

WORKDIR /opt/keycloak

# Copy custom theme provider JAR
COPY --from=keycloakify_jar_builder /opt/app/dist_keycloak/*.jar /opt/keycloak/providers/

# Build-time config (safe)
ENV KC_DB=postgres \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_PROXY=edge

RUN /opt/keycloak/bin/kc.sh build


############################################
# Stage 3: Runtime image
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}

WORKDIR /opt/keycloak

COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Default runtime env — all secrets come from docker-compose
ENV KC_PROXY=edge \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

# Expose HTTP and HTTPS ports
EXPOSE 8080
# EXPOSE 8443

# Healthcheck (HTTP is always enabled in dev mode)
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=5 \
  CMD curl -f http://localhost:8080/health/ready || exit 1

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]
