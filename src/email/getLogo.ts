// Helper to centralize logo selection logic for email templates
// Accepts the `exp` helper (from createVariablesHelper) and a boolean indicating preview mode
// Returns an object with `logoSrc` and `clientName` suitable for passing to EmailLayout
export function getLogo(exp: any, isPreview: boolean = false) {
  const logoSrc = isPreview ? "/assets/kc-logo.png" : exp("properties.domain_path_for_logo");
  return { logoSrc };
}
