import { Text, render, Container, Button } from "jsx-email";
import { EmailLayout } from "../layout";
import type { GetSubject, GetTemplate, GetTemplateProps } from "keycloakify-emails";
import { createVariablesHelper } from "keycloakify-emails/variables";
import * as Fm from "keycloakify-emails/jsx-email";

interface TemplateProps extends Omit<GetTemplateProps, "plainText"> { }

const paragraph = {
  color: "#475066",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  margin: "16px 0",
};

export const previewProps: TemplateProps = {
  locale: "en",
  themeName: "keycloak-custom",
};

export const templateName = "Password Reset";

const { v, exp } = createVariablesHelper("password-reset.ftl");
// Try to get client logo from the SPI context first, fallback to properties
// Cast to 'any' to access client object from the new email SPI extension
const logoSrc = import.meta.isJsxEmailPreview 
  ? "/assets/kc-logo.png" 
  : exp("client.logoUri ?? properties.domain_logo" as any);
const clientName = import.meta.isJsxEmailPreview 
  ? "Test Client" 
  : exp("client.name ?? realmName" as any);

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout 
    preview={`Reset your password`} 
    locale={locale}
    logoUrl={logoSrc}
    logoAlt={`${clientName} Logo`}
  >
    <Text style={paragraph}>
      <p>
        Someone just requested to change your {exp("realmName" as any)} account's credentials. If this was you, click on the link below to reset them.
      </p>
      <p>
        <Container style={{ textAlign: "center", margin: "32px 0" }}>
          <Fm.If condition={`${v("link")}??`}>
            <table role="presentation" border={0} cellPadding={0} cellSpacing={0} align="center" width="100%">
              <tr>
                <td align="center">
                  <Button
                    href={exp("link")}
                    height={50}
                    width={150}
                    style={{
                      backgroundColor: "#10b981",
                      color: "#ffffff",
                      fontSize: "16px",
                      fontWeight: "600",
                      textDecoration: "none",
                      borderRadius: "8px",
                      display: "inline-block",
                      padding: "14px 32px",
                      maxWidth: "100%",      // Make it responsive
                      boxSizing: "border-box",
                      boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    Reset password
                  </Button>
                </td>
              </tr>
            </table>
          </Fm.If>

          <Fm.If condition={`!(${v("link")}??)`}>
            <Text style={{ color: "#dc2626", fontSize: "14px", margin: "0" }}>
              Verification link unavailable
            </Text>
          </Fm.If>
        </Container>
      </p>
      <p>
        This link will expire within {exp("linkExpirationFormatter(linkExpiration)" as any)}.
      </p>
      <p>
        If you don't want to reset your credentials, just ignore this message and nothing will be changed.
      </p>
    </Text>
  </EmailLayout>
);
export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (_props) => {
  return "Reset password";
};
