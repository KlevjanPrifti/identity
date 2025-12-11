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
# Stage 2: Build Keycloak (NO SECRETS HERE)
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS builder

WORKDIR /opt/keycloak

# Copy theme JAR
COPY --from=keycloakify_jar_builder /opt/app/dist_keycloak/*.jar /opt/keycloak/providers/

# Build-time feature configuration (NO sensitive data)
ENV KC_DB=postgres \
    KC_HTTP_ENABLED=true \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_PROXY=edge

# Build the optimized server (no secrets needed)
RUN /opt/keycloak/bin/kc.sh build

############################################
# Stage 3: Runtime Image (Secrets ONLY here)
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}

WORKDIR /opt/keycloak

# Copy built Keycloak from Stage 2
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Runtime configuration - ALL from environment at container start
ENV KC_DB=postgres \
    KC_HTTP_ENABLED=true \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_PROXY=edge

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health/ready || exit 1

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]