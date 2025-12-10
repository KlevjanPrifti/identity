package com.example.keycloak.email;

import org.jboss.logging.Logger;
import org.keycloak.Config;
import org.keycloak.email.EmailTemplateProvider;
import org.keycloak.email.EmailTemplateProviderFactory;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;

/**
 * Factory class for creating instances of CustomEmailTemplateProvider.
 *
 * <p>This factory wraps the default EmailTemplateProvider to inject client information
 * into email template contexts. It is responsible for:
 * <ol>
 *   <li>Creating and configuring CustomEmailTemplateProvider instances</li>
 *   <li>Wrapping the default provider with client context enrichment</li>
 *   <li>Managing the lifecycle of the provider</li>
 *   <li>Registering the provider with Keycloak's SPI</li>
 * </ol>
 *
 * <p>The provider ID "custom-email-template" is used to identify this implementation.
 * To enable this provider, configure it in your Keycloak configuration or via
 * the spi-email-template-provider property.
 *
 * @author Extended Keycloak Email SPI
 */
public class CustomEmailTemplateProviderFactory implements EmailTemplateProviderFactory {

    private static final Logger logger = Logger.getLogger(CustomEmailTemplateProviderFactory.class);

    public static final String PROVIDER_ID = "custom-email-template";
    private static final String FREEMARKER_PROVIDER_ID = "freemarker";

    private EmailTemplateProviderFactory defaultFactory;

    @Override
    public EmailTemplateProvider create(KeycloakSession session) {
        if (session == null) {
            logger.error("KeycloakSession is null, cannot create CustomEmailTemplateProvider");
            throw new IllegalArgumentException("KeycloakSession cannot be null");
        }

        // Try to get the FreeMarker provider (Keycloak's default implementation)
        EmailTemplateProvider defaultProvider = session.getProvider(
                EmailTemplateProvider.class,
                FREEMARKER_PROVIDER_ID
        );

        // If FreeMarker provider is not available, try to create one using the factory
        if (defaultProvider == null && defaultFactory != null) {
            logger.debugf("FreeMarker provider not found in session, creating from factory");
            defaultProvider = defaultFactory.create(session);
        }

        if (defaultProvider == null) {
            logger.errorf("No base EmailTemplateProvider found. Cannot create %s", PROVIDER_ID);
            throw new IllegalStateException("Base EmailTemplateProvider is not available");
        }

        logger.tracef("Creating CustomEmailTemplateProvider wrapping base provider");

        // Wrap it with our custom provider to inject client info
        return new CustomEmailTemplateProvider(defaultProvider);
    }

    @Override
    public void init(Config.Scope config) {
        logger.debugf("Initializing %s", PROVIDER_ID);

        // Initialization logic if needed
        // This could be used to load configuration from keycloak.json or other sources
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
        logger.debugf("Post-initializing %s", PROVIDER_ID);

        // Store reference to the default FreeMarker factory for fallback
        if (factory != null) {
            defaultFactory = (EmailTemplateProviderFactory) factory.getProviderFactory(
                    EmailTemplateProvider.class,
                    FREEMARKER_PROVIDER_ID
            );

            if (defaultFactory == null) {
                logger.warn("FreeMarker EmailTemplateProviderFactory not found during post-init. " +
                        "Custom email provider may not work correctly.");
            } else {
                logger.debugf("Successfully obtained reference to FreeMarker factory");
            }
        }
    }

    @Override
    public void close() {
        logger.debugf("Closing %s factory", PROVIDER_ID);
        defaultFactory = null;
    }

    @Override
    public String getId() {
        return PROVIDER_ID;
    }

    @Override
    public int order() {
        // Return a higher number to have this provider take precedence over default
        // Default implementations typically return 0
        return 100;
    }
}