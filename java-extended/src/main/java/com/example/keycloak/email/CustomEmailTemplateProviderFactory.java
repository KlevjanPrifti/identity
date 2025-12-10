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
    private static final String DEFAULT_PROVIDER_ID = "default";

    @Override
    public EmailTemplateProvider create(KeycloakSession session) {
        if (session == null) {
            logger.error("KeycloakSession is null, cannot create CustomEmailTemplateProvider");
            throw new IllegalArgumentException("KeycloakSession cannot be null");
        }

        // Get the default email template provider
        EmailTemplateProvider defaultProvider = session.getProvider(EmailTemplateProvider.class, DEFAULT_PROVIDER_ID);

        if (defaultProvider == null) {
            logger.errorf("Default EmailTemplateProvider not found. Cannot create %s", PROVIDER_ID);
            throw new IllegalStateException("Default EmailTemplateProvider is not available");
        }

        logger.tracef("Creating CustomEmailTemplateProvider wrapping default provider");

        // Wrap it with our custom provider to inject client info
        return new CustomEmailTemplateProvider(defaultProvider);
    }

    @Override
    public void init(Config.Scope config) {
        logger.debugf("Initializing %s", PROVIDER_ID);

        // Initialization logic if needed
        // This could be used to load configuration from keycloak.json or other sources
        // Example:
        // if (config != null) {
        //     String someConfig = config.get("some-property", "default-value");
        //     logger.infof("Loaded configuration: some-property=%s", someConfig);
        // }
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
        logger.debugf("Post-initializing %s", PROVIDER_ID);

        // Post-initialization logic if needed
        // This is called after all providers have been initialized
        // Useful for cross-provider setup or validation
    }

    @Override
    public void close() {
        logger.debugf("Closing %s factory", PROVIDER_ID);

        // Cleanup resources if needed
        // This is called when Keycloak shuts down
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