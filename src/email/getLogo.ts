// Helper to centralize logo selection logic for email templates
// Accepts the `exp` helper (from createVariablesHelper) and a boolean indicating preview mode
// Returns an object with `logoSrc` and `clientName` suitable for passing to EmailLayout

export function getLogo(exp: any, isPreview: boolean = false) {
  const logoSrc = isPreview
    ? "/assets/kc-logo.png"
    : exp("client.logoUri ?? properties.domain_logo" as any);

  const clientName = isPreview
    ? "Test Client"
    : exp("client.name ?? realmName" as any);

  return { logoSrc, clientName };
}
