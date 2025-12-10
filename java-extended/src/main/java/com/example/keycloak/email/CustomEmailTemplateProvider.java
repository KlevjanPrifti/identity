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
 * to inject full kcContext including client information into email templates.
 *
 * <p>This allows email templates to access:
 * <ul>
 *   <li>client.clientId</li>
 *   <li>client.name</li>
 *   <li>client.attributes (including logoUri, etc.)</li>
 *   <li>client.redirectUris</li>
 *   <li>And all other ClientModel properties</li>
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
     * Builds a client context map from the ClientModel.
     *
     * @param client The ClientModel to extract information from
     * @return Map containing client information
     */
    private Map<String, Object> buildClientContext(ClientModel client) {
        Map<String, Object> clientContext = new HashMap<>();

        // Client basic information - handle null values safely
        clientContext.put(CLIENT_ID_KEY, client.getClientId());
        clientContext.put("name", client.getName());
        clientContext.put("description", client.getDescription());
        clientContext.put("protocol", client.getProtocol());
        clientContext.put("publicClient", client.isPublicClient());
        clientContext.put("enabled", client.isEnabled());
        clientContext.put("consentRequired", client.isConsentRequired());

        // Client attributes (includes logoUri, etc.)
        Map<String, String> attributes = client.getAttributes();
        if (attributes != null && !attributes.isEmpty()) {
            // Create defensive copy to prevent external modification
            Map<String, String> attributesCopy = new HashMap<>(attributes);
            clientContext.put("attributes", attributesCopy);

            // Convenience accessors for common attributes
            clientContext.put(LOGO_URI_ATTR, attributes.get(LOGO_URI_ATTR));
            clientContext.put(LOGO_URL_ATTR, attributes.get(LOGO_URL_ATTR));
            clientContext.put(DISPLAY_NAME_ATTR, attributes.get(DISPLAY_NAME_ATTR));
        } else {
            clientContext.put("attributes", Collections.emptyMap());
        }

        // Redirect URIs and origins - handle null collections safely
        clientContext.put("redirectUris",
                client.getRedirectUris() != null ? client.getRedirectUris() : Collections.emptySet());
        clientContext.put("webOrigins",
                client.getWebOrigins() != null ? client.getWebOrigins() : Collections.emptySet());
        clientContext.put("baseUrl", client.getBaseUrl());
        clientContext.put("rootUrl", client.getRootUrl());

        return clientContext;
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
        if (delegate != null) {
            delegate.close();
        }
    }
}