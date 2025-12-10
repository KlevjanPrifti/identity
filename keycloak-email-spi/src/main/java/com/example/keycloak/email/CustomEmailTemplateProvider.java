package com.example.keycloak.email;

import org.jboss.logging.Logger;
import org.keycloak.email.EmailException;
import org.keycloak.email.EmailTemplateProvider;
import org.keycloak.events.Event;
import org.keycloak.models.ClientModel;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.sessions.AuthenticationSessionModel;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Custom Email Template Provider that wraps Keycloak's EmailTemplateProvider
 * to inject safe, sanitized client information into email templates.
 *
 * <p>Security Features:
 * <ul>
 *   <li>Whitelisted attributes only (logoUri, logoUrl, displayName)</li>
 *   <li>Input sanitization to prevent template injection</li>
 *   <li>URL validation to prevent malicious protocols</li>
 *   <li>Length limits to prevent DoS attacks</li>
 *   <li>Immutable collections in context</li>
 * </ul>
 *
 * <p>Available template variables:
 * <ul>
 *   <li>client.clientId - The OAuth client identifier</li>
 *   <li>client.name - The client display name</li>
 *   <li>client.logoUri - Whitelisted logo URI (if configured)</li>
 *   <li>client.logoUrl - Whitelisted logo URL (if configured)</li>
 *   <li>client.displayName - Whitelisted display name (if configured)</li>
 *   <li>client.attributes - Map containing only whitelisted attributes</li>
 * </ul>
 *
 * @author Extended Keycloak Email SPI
 */
public class CustomEmailTemplateProvider implements EmailTemplateProvider {

    private static final Logger logger = Logger.getLogger(CustomEmailTemplateProvider.class);

    private static final String CLIENT_ID_KEY = "clientId";
    private static final String CLIENT_KEY = "client";
    private static final String LOGO_URI_ATTR = "logoUri";
    private static final String LOGO_URL_ATTR = "logoUrl";
    private static final String DISPLAY_NAME_ATTR = "displayName";

    // Maximum lengths for security
    private static final int MAX_STRING_LENGTH = 500;
    private static final int MAX_URL_LENGTH = 2048;

    private final EmailTemplateProvider delegate;
    private RealmModel realm;

    public CustomEmailTemplateProvider(EmailTemplateProvider delegate) {
        this.delegate = Objects.requireNonNull(delegate, "Delegate EmailTemplateProvider cannot be null");
    }

    /**
     * Build the template context and inject client information.
     *
     * @param templateId The ID/name of the template
     * @param subject The email subject
     * @param templateData The base template data
     * @return Enhanced template context with client information
     */
    protected Map<String, Object> buildContext(String templateId, String subject, Map<String, Object> templateData) {
        if (templateData == null) {
            templateData = Collections.emptyMap();
        }

        Map<String, Object> context = new HashMap<>(templateData);

        // Sanitize potentially dangerous keys from templateData (defense in depth)
        sanitizeTemplateData(context);

        // Inject client information if available
        try {
            Object clientIdObj = context.get(CLIENT_ID_KEY);

            if (clientIdObj instanceof String) {
                String clientId = (String) clientIdObj;
                enrichContextWithClientInfo(context, clientId, templateId);
            }
        } catch (Exception e) {
            // Log error but don't fail email sending if something goes wrong
            logger.warnf(e, "Error enhancing email template context with client information for template: %s", templateId);
        }

        return context;
    }

    /**
     * Sanitizes template data to remove potentially dangerous content.
     * This is defense-in-depth since we don't control what's in templateData.
     *
     * @param templateData The template data map to sanitize in-place
     */
    private void sanitizeTemplateData(Map<String, Object> templateData) {
        // Remove any keys that could be used for template injection
        templateData.remove("__freemarker");
        templateData.remove(".data_model");

        // Sanitize string values that come from user input
        for (Map.Entry<String, Object> entry : new HashMap<>(templateData).entrySet()) {
            Object value = entry.getValue();
            if (value instanceof String) {
                String stringValue = (String) value;
                // Only sanitize if it looks suspicious (contains template markers)
                if (stringValue.contains("${") || stringValue.contains("<#")) {
                    templateData.put(entry.getKey(), sanitizeForTemplate(stringValue));
                }
            }
        }
    }

    /**
     * Enriches the context with client information.
     *
     * @param context The context map to enrich
     * @param clientId The client ID to look up
     * @param templateId The template ID for logging purposes
     */
    private void enrichContextWithClientInfo(Map<String, Object> context, String clientId, String templateId) {
        if (clientId == null || clientId.trim().isEmpty() || realm == null) {
            return;
        }

        ClientModel client = realm.getClientByClientId(clientId);

        if (client == null) {
            logger.debugf("Client not found for clientId: %s in template: %s", clientId, templateId);
            return;
        }

        Map<String, Object> clientContext = buildClientContext(client);
        context.put(CLIENT_KEY, clientContext);

        logger.debugf("Injected client context for client: %s in template: %s", clientId, templateId);
    }

    /**
     * Builds a client context map from the ClientModel with security-first approach.
     * Only whitelisted attributes and essential user-facing fields are included.
     * All string values are sanitized to prevent template injection attacks.
     *
     * @param client The ClientModel to extract information from
     * @return Map containing safe, sanitized client information
     */
    private Map<String, Object> buildClientContext(ClientModel client) {
        Map<String, Object> clientContext = new HashMap<>();

        // Only essential user-facing client information - sanitized
        clientContext.put(CLIENT_ID_KEY, sanitizeForTemplate(client.getClientId()));
        clientContext.put("name", sanitizeForTemplate(client.getName()));

        // Whitelist of safe attributes allowed in email templates
        final List<String> WHITELISTED_ATTRIBUTES = List.of(
                LOGO_URI_ATTR,      // logoUri
                LOGO_URL_ATTR,      // logoUrl
                DISPLAY_NAME_ATTR   // displayName
        );

        // Filter and sanitize attributes to only include whitelisted safe values
        Map<String, String> safeAttributes = new HashMap<>();
        Map<String, String> clientAttributes = client.getAttributes();

        if (clientAttributes != null && !clientAttributes.isEmpty()) {
            for (String allowedKey : WHITELISTED_ATTRIBUTES) {
                String value = clientAttributes.get(allowedKey);
                if (value != null) {
                    // Sanitize attribute values, with special handling for URLs
                    String sanitizedValue = isUrlAttribute(allowedKey)
                            ? sanitizeUrl(value)
                            : sanitizeForTemplate(value);

                    if (sanitizedValue != null) {
                        safeAttributes.put(allowedKey, sanitizedValue);
                    }
                }
            }
        }

        // Add filtered attributes map (may be empty but never null)
        clientContext.put("attributes", Collections.unmodifiableMap(safeAttributes));

        // Convenience accessors for whitelisted attributes (already sanitized)
        clientContext.put(LOGO_URI_ATTR, safeAttributes.get(LOGO_URI_ATTR));
        clientContext.put(LOGO_URL_ATTR, safeAttributes.get(LOGO_URL_ATTR));
        clientContext.put(DISPLAY_NAME_ATTR, safeAttributes.get(DISPLAY_NAME_ATTR));

        return clientContext;
    }

    /**
     * Checks if an attribute key represents a URL field.
     *
     * @param key The attribute key
     * @return true if the key represents a URL
     */
    private boolean isUrlAttribute(String key) {
        return LOGO_URI_ATTR.equals(key) || LOGO_URL_ATTR.equals(key);
    }

    /**
     * Sanitizes string values to prevent template injection attacks.
     * Removes potentially dangerous characters while preserving readable text.
     *
     * @param value The string to sanitize
     * @return Sanitized string safe for template rendering, or null if input is null
     */
    private String sanitizeForTemplate(String value) {
        if (value == null) {
            return null;
        }

        // Remove any FreeMarker template directives and expressions
        String sanitized = value
                .replaceAll("<#.*?#>", "")           // Remove FreeMarker directives
                .replaceAll("\\$\\{.*?}", "")        // Remove FreeMarker expressions ${...}
                .replaceAll("<@.*?@>", "")           // Remove FreeMarker user-defined directives
                .replaceAll("\\[#.*?#]", "");        // Remove alternative FreeMarker syntax

        // Remove HTML script tags and event handlers (defense in depth)
        sanitized = sanitized
                .replaceAll("(?i)<script[^>]*>.*?</script>", "")
                .replaceAll("(?i)on\\w+\\s*=", "");  // Remove onclick, onerror, etc.

        // Limit length to prevent DoS via extremely long strings in emails
        if (sanitized.length() > MAX_STRING_LENGTH) {
            sanitized = sanitized.substring(0, MAX_STRING_LENGTH);
            logger.warnf("Truncated oversized template value (original length: %d)", value.length());
        }

        return sanitized.trim();
    }

    /**
     * Sanitizes and validates URL values to prevent injection and ensure they're safe.
     *
     * @param url The URL string to sanitize
     * @return Sanitized URL safe for template rendering, or null if invalid
     */
    private String sanitizeUrl(String url) {
        if (url == null) {
            return null;
        }

        String trimmed = url.trim();

        // Only allow HTTP(S) and data URLs for images
        if (!trimmed.matches("^(https?://|data:image/).*")) {
            logger.warnf("Rejected non-HTTP(S) URL in client attributes: %s",
                    trimmed.substring(0, Math.min(50, trimmed.length())));
            return null;
        }

        // Remove any FreeMarker expressions from URLs
        String sanitized = trimmed
                .replaceAll("\\$\\{.*?}", "")
                .replaceAll("<#.*?#>", "");

        // Prevent javascript: and other dangerous protocols that might bypass initial check
        if (sanitized.toLowerCase().contains("javascript:") ||
                sanitized.toLowerCase().contains("data:text/html")) {
            logger.warnf("Rejected potentially dangerous URL in client attributes");
            return null;
        }

        // Limit URL length
        if (sanitized.length() > MAX_URL_LENGTH) {
            logger.warnf("Rejected oversized URL (length: %d)", sanitized.length());
            return null;
        }

        return sanitized;
    }

    @Override
    public EmailTemplateProvider setRealm(RealmModel realm) {
        this.realm = realm;
        delegate.setRealm(realm);
        return this;
    }

    @Override
    public EmailTemplateProvider setUser(UserModel user) {
        delegate.setUser(user);
        return this;
    }

    @Override
    public EmailTemplateProvider setAttribute(String name, Object value) {
        delegate.setAttribute(name, value);
        return this;
    }

    @Override
    public EmailTemplateProvider setAuthenticationSession(AuthenticationSessionModel authSession) {
        delegate.setAuthenticationSession(authSession);
        return this;
    }

    @Override
    public void send(String templateId, String subject, Map<String, Object> templateData) throws EmailException {
        Map<String, Object> enrichedContext = buildContext(templateId, subject, templateData);
        delegate.send(templateId, subject, enrichedContext);
    }

    @Override
    public void send(String templateId, List<Object> recipients, String subject, Map<String, Object> templateData) throws EmailException {
        Map<String, Object> enrichedContext = buildContext(templateId, subject, templateData);
        delegate.send(templateId, recipients, subject, enrichedContext);
    }

    @Override
    public void sendVerifyEmail(String link, long expirationTime) throws EmailException {
        delegate.sendVerifyEmail(link, expirationTime);
    }

    @Override
    public void sendPasswordReset(String link, long expirationTime) throws EmailException {
        delegate.sendPasswordReset(link, expirationTime);
    }

    @Override
    public void sendEmailUpdateConfirmation(String link, long expirationTime, String changeEmailExpiredMessage) throws EmailException {
        delegate.sendEmailUpdateConfirmation(link, expirationTime, changeEmailExpiredMessage);
    }

    @Override
    public void sendExecuteActions(String link, long expirationTime) throws EmailException {
        delegate.sendExecuteActions(link, expirationTime);
    }

    @Override
    public void sendConfirmIdentityBrokerLink(String link, long expirationTime) throws EmailException {
        delegate.sendConfirmIdentityBrokerLink(link, expirationTime);
    }

    @Override
    public void sendEvent(Event event) throws EmailException {
        delegate.sendEvent(event);
    }

    @Override
    public void sendSmtpTestEmail(Map<String, String> config, UserModel user) throws EmailException {
        delegate.sendSmtpTestEmail(config, user);
    }

    @Override
    public void close() {
        delegate.close();
    }
}