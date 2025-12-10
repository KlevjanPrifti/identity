# Keycloak Email Template SPI Extension

This project extends Keycloak's email template system to inject **full kcContext including client information** into email templates, allowing you to access client properties like logos, names, and custom attributes directly from your FreeMarker email templates.

## Overview

By default, Keycloak's email templates only have access to limited context:
- `realm` - basic realm information
- `user` - user details
- Limited template-specific properties

This SPI extension enriches the email template context by adding:
- Full `client` object with all ClientModel properties
- `client.clientId` - OAuth2 client identifier
- `client.name` - Client display name
- `client.attributes` - Custom client attributes (including logoUri, displayName, etc.)
- `client.logoUri` / `client.logoUrl` - Direct access to logo
- `client.redirectUris` - List of allowed redirect URIs
- `client.webOrigins` - List of allowed web origins
- And more...

## Project Structure

```
keycloak-email-spi/
├── pom.xml
├── README.md
├── DEPLOYMENT.md
└── src/
    └── main/
        ├── java/com/example/keycloak/email/
        │   ├── CustomEmailTemplateProvider.java
        │   └── CustomEmailTemplateProviderFactory.java
        └── resources/META-INF/services/
            └── org.keycloak.email.EmailTemplateProviderFactory
```

## Key Components

### 1. CustomEmailTemplateProvider
Extends `FreeMarkerEmailTemplateProvider` to override the `getDefaultContext()` method and inject client information.

**Main Features:**
- Retrieves the client from the KeycloakSession
- Builds a rich client context object
- Safely handles errors without breaking email sending
- Logs debug information for troubleshooting

### 2. CustomEmailTemplateProviderFactory
Implements `EmailTemplateProviderFactory` to register the custom provider with Keycloak's SPI.

**Key Details:**
- Provider ID: `custom-email-template`
- Manages provider lifecycle
- Creates CustomEmailTemplateProvider instances

### 3. SPI Service Provider Configuration
The `META-INF/services/org.keycloak.email.EmailTemplateProviderFactory` file registers this factory with Java's ServiceLoader mechanism.

## Building the Project

### Prerequisites
- Java 11 or higher
- Maven 3.6.0 or higher

### Build Command

```bash
cd keycloak-email-spi
mvn clean package
```

This will create:
- `target/keycloak-email-spi-1.0.0.jar` - The main JAR file

The maven-shade-plugin is configured to handle SPI configuration properly during shading.

## Deployment

### Option 1: Direct Deployment to Keycloak Providers Directory

```bash
# Copy JAR to Keycloak providers folder
cp target/keycloak-email-spi-1.0.0.jar $KEYCLOAK_HOME/providers/

# Rebuild and restart Keycloak
$KEYCLOAK_HOME/bin/kc.sh build
$KEYCLOAK_HOME/bin/kc.sh start  # or start-dev
```

### Option 2: Docker Deployment

If using Docker, add to your Dockerfile:

```dockerfile
COPY target/keycloak-email-spi-1.0.0.jar /opt/keycloak/providers/
RUN /opt/keycloak/bin/kc.sh build
```

### Option 3: Docker Compose

If using docker-compose, mount the JAR:

```yaml
services:
  keycloak:
    volumes:
      - ./keycloak-email-spi/target/keycloak-email-spi-1.0.0.jar:/opt/keycloak/providers/keycloak-email-spi-1.0.0.jar
```

## Configuration

### Enabling the Custom Email Provider

1. Log in to Keycloak Admin Console
2. Navigate to Realm Settings → Email
3. In the "From" or other email configuration, ensure the realm uses the custom provider

### Alternative: Configuration File

You can also configure via `keycloak.json` or environment variables:

```
KC_EMAIL_PROVIDER=custom-email-template
```

## Using in Email Templates

Once deployed and enabled, you can use the full client context in your email templates.

### Example: Email Verification Template

```html
<!DOCTYPE html>
<html>
<head>
    <title>Verify Your Email</title>
</head>
<body>
    <!-- Access client logo -->
    <#if client?? && client.logoUri??>
        <img src="${client.logoUri}" alt="${client.name}" style="max-width: 200px;"/>
    </#if>

    <!-- Welcome message with client name -->
    <h1>Welcome to ${client.name!"Our Service"}!</h1>

    <!-- Standard verification link -->
    <p>Please verify your email by clicking the link below:</p>
    <a href="${link}">${link}</a>

    <!-- Client-specific footer -->
    <#if client?? && client.attributes.companyName??>
        <footer>© ${client.attributes.companyName}</footer>
    </#if>
</body>
</html>
```

### Available Template Variables

#### From Parent (Default Context)
- `realm` - Realm object
- `user` - User object
- `link` - Action link (for verification, password reset, etc.)
- `linkExpiration` - Link expiration time
- Other template-specific variables

#### Newly Available (Custom Enhancement)
- `client.clientId` - OAuth2 Client ID
- `client.name` - Client display name
- `client.description` - Client description
- `client.protocol` - Protocol (openid-connect, saml, etc.)
- `client.publicClient` - Is public client flag
- `client.enabled` - Is enabled flag
- `client.attributes` - Map of all custom attributes
- `client.logoUri` - Logo URI (from attributes)
- `client.logoUrl` - Logo URL (from attributes)
- `client.displayName` - Display name (from attributes)
- `client.redirectUris` - Set of redirect URIs
- `client.webOrigins` - Set of web origins
- `client.allProtocolMappers` - Protocol mappers collection

## Example Email Template with Client Info

```xml
<!-- Password Reset Email Template (HTML) -->
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .logo { max-width: 150px; margin-bottom: 20px; }
        .footer { color: #666; border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; }
    </style>
</head>
<body>
    <#if client?? && client.logoUri??>
        <img src="${client.logoUri}" alt="Logo" class="logo"/>
    </#if>

    <h2>Password Reset Request</h2>

    <p>Hi ${user.firstName!"there"},</p>

    <p>Someone requested a password reset for your account on ${client.name!"our platform"}.</p>

    <p><a href="${link}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Reset Password
    </a></p>

    <p>If you didn't request this, you can ignore this email.</p>

    <div class="footer">
        <#if client?? && client.attributes.supportEmail??>
            <p>Questions? Contact us: ${client.attributes.supportEmail}</p>
        </#if>
        <p>&copy; 2024 ${client.name!"Our Platform"}. All rights reserved.</p>
    </div>
</body>
</html>
```

## Troubleshooting

### JAR Not Being Loaded

1. **Check logs** for errors during Keycloak startup
2. **Verify file location**: JAR should be in `$KEYCLOAK_HOME/providers/`
3. **Run build command**: `kc.sh build` rebuilds the runtime
4. **Check SPI configuration**: Ensure file `META-INF/services/org.keycloak.email.EmailTemplateProviderFactory` exists in JAR

To verify SPI registration:

```bash
# List files in JAR
jar tf target/keycloak-email-spi-1.0.0.jar | grep -i "emailtemplate"
```

### Client Not Available in Template

1. **Check if clientId is passed** to the email sender
2. **Review logs** for warning messages about client lookup
3. **Verify realm name** matches in KeycloakSession

### Maven Build Issues

**No Keycloak dependencies found:**
```bash
# Ensure Maven Central is in your settings.xml
mvn -U clean package
```

**Java version mismatch:**
```bash
# Set Java compiler version explicitly
export JAVA_HOME=/path/to/java11
mvn clean package
```

## Dependencies

The project depends on:
- **keycloak-server-spi** (v21.0.1) - Core SPI interfaces
- **keycloak-server-spi-private** (v21.0.1) - Private SPI extensions
- **keycloak-core** (v21.0.1) - Core Keycloak models
- **freemarker** (v2.3.31) - Template engine
- **jboss-logging** (v3.4.3.Final) - Logging framework
- **jakarta.mail-api** (v2.0.1) - Mail API

All dependencies are marked as `provided` scope, meaning they're supplied by Keycloak at runtime.

## Version Compatibility

This project is built for **Keycloak 21.0.1**. It should work with other Keycloak versions in the 21.x range. For other major versions, you may need to adjust:

1. Update `keycloak.version` in `pom.xml`
2. Verify API compatibility with target Keycloak version
3. Test thoroughly before production deployment

## License

This project is provided as-is for extending Keycloak functionality.

## Support

For issues or questions:

1. Check the [Keycloak documentation](https://www.keycloak.org/documentation)
2. Review the [Keycloak Community](https://www.keycloak.org/community)
3. Check the logs in `$KEYCLOAK_HOME/standalone/log/server.log`

## Advanced: Custom Configuration

You can extend `CustomEmailTemplateProviderFactory` to add custom configuration:

```java
@Override
public void init(Config.Scope config) {
    String customSetting = config.get("customProperty", "defaultValue");
    // Use configuration
}
```

Then configure in keycloak.json:

```json
{
  "providers": {
    "email": {
      "custom-email-template": {
        "customProperty": "customValue"
      }
    }
  }
}
```

## References

- [Keycloak SPI Documentation](https://www.keycloak.org/docs/latest/server_development/#_service_provider_interfaces)
- [Keycloak Email SPI](https://www.keycloak.org/docs/latest/server_development/#_email_provider)
- [FreeMarker Template Engine](https://freemarker.apache.org/)
