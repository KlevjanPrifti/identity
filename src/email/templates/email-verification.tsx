import { Text, render, Container, Button, Hr } from "jsx-email";
import * as Fm from "keycloakify-emails/jsx-email";
import { EmailLayout } from "../layout";
import type { GetSubject, GetTemplate, GetTemplateProps } from "keycloakify-emails";
import { createVariablesHelper } from "keycloakify-emails/variables";
import { getLogo } from "../getLogo";

interface TemplateProps extends Omit<GetTemplateProps, "plainText"> { }

const styles = {
  logoContainer: {
    textAlign: "center" as const,
    paddingBottom: "32px",
  },

  badge: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
    margin: "0 0 16px 0",
  },

  header: {
    color: "#1a1a1a",
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "32px",
    margin: "0 0 24px 0",
    textAlign: "left" as const,
  },

  paragraph: {
    color: "#4a5568",
    fontSize: "16px",
    lineHeight: "26px",
    margin: "0 0 20px 0",
    textAlign: "left" as const,
  },

  welcomeBox: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0",
    textAlign: "center" as const,
  },

  welcomeText: {
    color: "#166534",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 8px 0",
  },

  welcomeSubtext: {
    color: "#15803d",
    fontSize: "14px",
    margin: "0",
  },

  buttonContainer: {
    textAlign: "center" as const,
    margin: "32px 0",
  },

  button: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "14px 40px",
    borderRadius: "8px",
    display: "inline-block",
    boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
  },

  divider: {
    borderColor: "#e5e7eb",
    margin: "32px 0",
  },

  infoBox: {
    backgroundColor: "#fef3c7",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "24px 0",
  },

  infoText: {
    color: "#92400e",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "0",
  },

  stepsList: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "20px 24px",
    margin: "24px 0",
  },

  stepItem: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: "24px",
    margin: "12px 0",
    paddingLeft: "8px",
  },

  linkFallback: {
    color: "#6b7280",
    fontSize: "13px",
    lineHeight: "20px",
    wordBreak: "break-all" as const,
    margin: "16px 0",
    padding: "12px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
  },

  securityNote: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "24px 0",
  },

  securityText: {
    color: "#0c4a6e",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "0",
  },
};

export const previewProps: TemplateProps = {
  locale: "en",
  themeName: "keycloak-custom",
};

export const templateName = "Email Verification";

const { exp, v } = createVariablesHelper("email-verification.ftl");
const { logoSrc } = getLogo(exp, import.meta.isJsxEmailPreview);

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout 
    preview="Welcome! Please verify your email address" 
    locale={locale}
    logoUrl={logoSrc}
  >

    <Text style={styles.badge}>ACCOUNT CREATED</Text>

    <Text style={styles.header}>
      Welcome! Verify Your Email
    </Text>

    <Container style={styles.welcomeBox}>
      <Text style={styles.welcomeText}>
        Your account has been created!
      </Text>
      <Text style={styles.welcomeSubtext}>
        Just one more step to get started
      </Text>
    </Container>

    <Text style={styles.paragraph}>
      A new account has been created with this email address for{" "}
      <Fm.If condition={`${v("realmName")}??`}>
        <strong>{exp("realmName")}</strong>
      </Fm.If>
      <Fm.If condition={`!(${v("realmName")}??)`}>
        your realm
      </Fm.If>
      . To activate your account and start using our services, please verify your email address.
    </Text>

    <Container style={styles.stepsList}>
      <Text style={styles.stepItem}>
        <strong>1.</strong> Click the verification button below
      </Text>
      <Text style={styles.stepItem}>
        <strong>2.</strong> You'll be redirected to complete your setup
      </Text>
      <Text style={styles.stepItem}>
        <strong>3.</strong> Start exploring your new account!
      </Text>
    </Container>

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
                Update Account Now
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

    <Container style={styles.infoBox}>
      <Text style={styles.infoText}>
        <strong>Time Sensitive</strong>
        <br /><br />
        This verification link will expire in{" "}
        <Fm.If condition={`${v("linkExpiration")}??`}>
          <strong>{exp("linkExpirationFormatter(linkExpiration)")}</strong>
        </Fm.If>
        <Fm.If condition={`!(${v("linkExpiration")}??)`}>
          a limited time
        </Fm.If>
        . Please verify your email as soon as possible to avoid having to request a new link.
      </Text>
    </Container>

    <Hr style={styles.divider} />

    <Container style={styles.securityNote}>
      <Text style={styles.securityText}>
        <strong>Didn't create this account?</strong>
        <br /><br />
        If you didn't sign up for this account, you can safely ignore this email.
        The account will not be activated without verification, and no further action is needed from you.
      </Text>
    </Container>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (_props) => {
  return "Welcome! Verify Your Email Address";
};
