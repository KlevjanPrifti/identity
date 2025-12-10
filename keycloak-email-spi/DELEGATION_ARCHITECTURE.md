# Delegation Architecture - Keycloak Real Code Preservation

## Overview

This implementation preserves and uses Keycloak's real email provider code while adding a small, well-scoped enhancement: injecting full client information into email template contexts. The pattern used is a Decorator/Wrapper — we wrap Keycloak's existing provider and delegate all behavior to it, only enriching the template context when sending emails.

## Key Points from the Source

- Provider ID: `custom-email-template` (the factory exposes this id).
- The factory looks up Keycloak's FreeMarker implementation (provider id `freemarker`) as the base provider; if not available in the session it will attempt to obtain/instantiate it via a stored fallback factory obtained during postInit.
- The custom provider wraps the base provider and delegates every operation. For send(...) calls that accept template context data it first enriches the context (adds a `client` object) and then calls the delegate.
- The provider stores RealmModel when setRealm(...) is called and delegates setRealm(...) to the wrapped provider.
- buildContext(...) is defensive: if templateData is null it treats it as an empty map; it only injects client information when a `clientId` string is present in the template data and a realm is available.
- Client context produced includes: clientId, name, description, protocol, publicClient, enabled, consentRequired, attributes (defensive copy) and convenience keys (logoUri, logoUrl, displayName), redirectUris, webOrigins, baseUrl and rootUrl.
- Error handling: enrichment is wrapped in try/catch — failures are logged and do not stop email sending (to avoid breaking Keycloak behavior).

## How It Works (updated to match source)

### 1. Factory obtains the base (FreeMarker) provider

```java
// CustomEmailTemplateProviderFactory.java
@Override
public EmailTemplateProvider create(KeycloakSession session) {
    // Try FreeMarker (Keycloak's default implementation)
    EmailTemplateProvider defaultProvider = session.getProvider(
        EmailTemplateProvider.class,
        "freemarker"
    );

    // Fallback: try to create from saved factory reference (postInit may have stored it)
    if (defaultProvider == null && defaultFactory != null) {
        defaultProvider = defaultFactory.create(session);
    }

    return new CustomEmailTemplateProvider(defaultProvider);
}
```

Notes:
- postInit(...) on the factory stores a reference to the FreeMarker EmailTemplateProviderFactory (if available) so the factory can create the base provider when the session doesn't expose it directly.
- The factory's order() returns a high value (100) so it takes precedence over default providers where provider selection by order is used.

### 2. Provider wraps, enriches context and delegates

```java
// CustomEmailTemplateProvider.java
public class CustomEmailTemplateProvider implements EmailTemplateProvider {
    private final EmailTemplateProvider delegate;  // wrapped Keycloak provider
    private RealmModel realm;                       // stored on setRealm(...)

    // send(...) that accepts templateData enriches the context and delegates
    @Override
    public void send(String templateId, String subject, Map<String, Object> templateData) throws EmailException {
        Map<String, Object> enrichedContext = buildContext(templateId, subject, templateData);
        delegate.send(templateId, subject, enrichedContext);
    }

    // Other send variants follow the same pattern or delegate directly when there's no templateData
    @Override
    public void send(String templateId, List<Object> recipients, String subject, Map<String, Object> templateData) throws EmailException {
        Map<String, Object> enrichedContext = buildContext(templateId, subject, templateData);
        delegate.send(templateId, recipients, subject, enrichedContext);
    }

    // Methods without template data are directly delegated
    @Override
    public void sendVerifyEmail(String link, long expirationTime) throws EmailException {
        delegate.sendVerifyEmail(link, expirationTime);
    }
    // ... other direct delegations omitted for brevity

    @Override
    public EmailTemplateProvider setRealm(RealmModel realm) {
        this.realm = realm;          // store realm for client lookup
        delegate.setRealm(realm);    // delegate to base provider
        return this;
    }
}
```

## Data Flow (accurate to code)
```
Email Send Request
    ↓
CustomEmailTemplateProvider.send(...)
    ↓
    ├─ buildContext(...) → if template data contains `clientId` and realm is set → look up ClientModel and inject `client` map
    ↓
delegate.send(...) → KEYCLOAK'S REAL EMAIL CODE EXECUTES
    ├─ Validates SMTP configuration
    ├─ Renders FreeMarker template with enriched context
    ├─ Sends email via SMTP server
    └─ Returns/throws Keycloak email exceptions
```

## What Keycloak Still Does (unchanged)

- SMTP configuration and validation
- Template discovery/loading from themes
- FreeMarker template rendering
- Email sending over SMTP (including TLS/SSL)
- Header/footer / reply-to / cc / bcc handling
- Attachment support and other native behaviors
- Error handling and exceptions

## What This Extension Adds

- A `client` object injected into template context when `clientId` is present in the template data and the realm is available.
- The `client` map exposes a safe snapshot of ClientModel data (clientId, name, description, attributes, redirectUris, webOrigins, baseUrl, rootUrl, and convenience attributes like logoUri/logoUrl/displayName).
- No change to the underlying email sending mechanism, template engine, or configuration.

## Implementation Details Worth Noting

- The factory uses provider id `freemarker` (not a generic `default`) when requesting the base provider from the session.
- The factory stores a fallback EmailTemplateProviderFactory reference during postInit to create the base provider if the session doesn't already expose it.
- buildContext(...) is defensive and logs warnings for enrichment errors instead of failing the send operation.
- setRealm(...) stores RealmModel (used for realm.getClientByClientId(...)) and forwards it to the delegate.
- All provider lifecycle methods (close, setUser, setAttribute, setAuthenticationSession, etc.) are delegated to the wrapped provider.

## Verification (code locations)

- Factory: CustomEmailTemplateProviderFactory (create, postInit, PROVIDER_ID = "custom-email-template", FREEMARKER_PROVIDER_ID = "freemarker").
- Provider: CustomEmailTemplateProvider (buildContext, enrichContextWithClientInfo, buildClientContext, setRealm, all send(...) methods and delegations).