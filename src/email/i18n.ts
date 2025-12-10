import type { GetMessages } from "keycloakify-emails";

/**
 * Default message provider for email templates.
 *
 * It's implemented as a function to allow callers to provide their own
 * localization context if needed (for example, to load translations from
 * a database or a third-party i18n library).
 *
 * You can return only the keys you want to override; missing keys will fall
 * back to the base theme provided by Keycloak.
 */
export const getMessages: GetMessages = (_props) => ({
  // Required action labels
  "requiredAction.CONFIGURE_TOTP": "Configure OTP",
  "requiredAction.TERMS_AND_CONDITIONS": "Terms and Conditions",
  "requiredAction.UPDATE_PASSWORD": "Update Password",
  "requiredAction.UPDATE_PROFILE": "Update Profile",
  "requiredAction.VERIFY_EMAIL": "Verify Email",
  "requiredAction.CONFIGURE_RECOVERY_AUTHN_CODES": "Generate Recovery Codes",

  // Units used for link expiration formatting. Uses Java MessageFormat/Choice
  // style for pluralization. If you need more complex plural rules you can
  // override these per-language using the same formatting syntax.
  // See: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/text/MessageFormat.html
  "linkExpirationFormatter.timePeriodUnit.seconds":
    "{0,choice,0#seconds|1#second|1<seconds}",
  "linkExpirationFormatter.timePeriodUnit.minutes":
    "{0,choice,0#minutes|1#minute|1<minutes}",
  "linkExpirationFormatter.timePeriodUnit.hours":
    "{0,choice,0#hours|1#hour|1<hours}",
  "linkExpirationFormatter.timePeriodUnit.days":
    "{0,choice,0#days|1#day|1<days}",
});

export default getMessages;
