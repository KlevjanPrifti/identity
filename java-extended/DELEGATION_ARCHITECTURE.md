# Delegation Architecture - Keycloak Real Code Preservation

## Overview

**Yes, this implementation preserves and uses Keycloak's real code 100%.**

The design uses the **Decorator/Wrapper Pattern** to enhance Keycloak's email functionality without replacing it.

## How It Works

### 1. Factory Gets Keycloak's Default Provider

```java
// CustomEmailTemplateProviderFactory.java
@Override
public EmailTemplateProvider create(KeycloakSession session) {
    // Get Keycloak's real, default email template provider
    EmailTemplateProvider defaultProvider = session.getProvider(
        EmailTemplateProvider.class, 
        "default"  // ← This is Keycloak's built-in provider
    );
    
    // Wrap it with our custom provider
    return new CustomEmailTemplateProvider(defaultProvider);
}
```

### 2. Our Provider Wraps and Delegates

```java
// CustomEmailTemplateProvider.java
public class CustomEmailTemplateProvider implements EmailTemplateProvider {
    private final EmailTemplateProvider delegate;  // ← Holds Keycloak's real provider
    
    public CustomEmailTemplateProvider(EmailTemplateProvider delegate) {
        this.delegate = delegate;  // ← Store reference to real provider
    }
    
    @Override
    public void send(String templateId, String subject, Map<String, Object> templateData) 
            throws EmailException {
        // 1. ENHANCE: Add client context
        Map<String, Object> enrichedContext = buildContext(templateId, subject, templateData);
        
        // 2. DELEGATE: Call Keycloak's real implementation
        delegate.send(templateId, subject, enrichedContext);
        //     ↑
        //     All real Keycloak email sending logic happens here
    }
}
```

## Data Flow

```
Email Send Request
    ↓
CustomEmailTemplateProvider.send()
    ↓
    ├─ buildContext() → Adds client data to template context
    ↓
delegate.send() → KEYCLOAK'S REAL CODE EXECUTES
    ├─ Validates SMTP configuration
    ├─ Renders FreeMarker template with enriched context
    ├─ Sends email via SMTP server
    └─ Returns/throws real Keycloak exceptions
```

## What Keycloak Still Does

✅ **All original Keycloak functionality is preserved:**

- SMTP Configuration Management
- Template Discovery & Loading from `$KEYCLOAK_HOME/themes/`
- FreeMarker Template Rendering
- Email Sending Logic
- Error Handling & Exceptions
- User/Realm/Client Validation
- Email Header/Footer Configuration
- Reply-To, From, CC, BCC handling
- Attachment Support (if configured)
- SMTP TLS/SSL Security
- Email Queuing (if enabled)

## What We Add

✨ **Only enhancement without replacement:**

- Additional template context variable: `client` object
- Client properties: `clientId`, `name`, `logoUri`, `attributes`, etc.
- **No changes to:**
  - Email sending mechanism
  - SMTP server interaction
  - Template rendering engine
  - Configuration management
  - Exception handling

## Verification

You can verify delegation by checking the code:

1. **Factory delegates provider creation:**
   ```java
   EmailTemplateProvider defaultProvider = session.getProvider(
       EmailTemplateProvider.class, 
       "default"
   );
   ```

2. **Every method delegates:**
   ```java
   @Override
   public void sendVerifyEmail(String link, long expirationTime) throws EmailException {
       delegate.sendVerifyEmail(link, expirationTime);  // ← Direct delegation
   }
   ```

3. **Context enrichment is minimal:**
   ```java
   Map<String, Object> enrichedContext = buildContext(...);
   delegate.send(..., enrichedContext);  // ← Only data changed, logic untouched
   ```

## Why This Approach?

✅ **Preserves compatibility** - Keycloak updates work transparently
✅ **No code duplication** - Don't reimplement email sending
✅ **Minimal risk** - Single responsibility (context enrichment only)
✅ **Easy debugging** - Real Keycloak code is still identifiable in stack traces
✅ **Testable** - Can test context enrichment separately from email sending

## Conclusion

This is a **true wrapper/decorator pattern implementation**. Keycloak's actual email sending code executes unchanged. We only intercept to add the `client` object to the template context before FreeMarker rendering happens.

All Keycloak features, configuration, and behavior remain fully functional.
