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
    backgroundColor: "#fef3c7",
    color: "#92400e",
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

  emailHighlight: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "6px",
    padding: "12px 16px",
    margin: "20px 0",
    textAlign: "center" as const,
  },

  emailText: {
    color: "#0369a1",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0",
  },

  buttonContainer: {
    textAlign: "center" as const,
    margin: "32px 0",
  },

  button: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "14px 32px",
    borderRadius: "8px",
    display: "inline-block",
    boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
  },

  divider: {
    borderColor: "#e5e7eb",
    margin: "32px 0",
  },

  warningBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "24px 0",
  },

  warningText: {
    color: "#991b1b",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "0",
  },

  expirationBox: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "12px 16px",
    margin: "20px 0",
    textAlign: "center" as const,
  },

  expirationText: {
    color: "#92400e",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0",
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
};

export const previewProps: TemplateProps = {
  locale: "en",
  themeName: "keycloak-custom",
};

export const templateName = "Email Update Confirmation";

const { exp, v } = createVariablesHelper("email-update-confirmation.ftl");
const { logoSrc } = getLogo(exp, import.meta.isJsxEmailPreview);

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview="Verify your new email address" locale={locale} logoUrl={logoSrc}>
    
    <Text style={styles.badge}>ACTION REQUIRED</Text>

    <Text style={styles.header}>
      Verify Your New Email Address
    </Text>

    <Text style={styles.paragraph}>
      Hello,
    </Text>

    <Text style={styles.paragraph}>
      You recently requested to update the email address for your{" "}
      <Fm.If condition={`${v("realmName")}??`}>
        <strong>{exp("realmName")}</strong>
      </Fm.If>
      <Fm.If condition={`!(${v("realmName")}??)`}>
        account
      </Fm.If>
      {" "}to:
    </Text>

    <Container style={styles.emailHighlight}>
      <Text style={styles.emailText}>
        <Fm.If condition={`${v("newEmail")}??`}>
          {exp("newEmail")}
        </Fm.If>
        <Fm.If condition={`!(${v("newEmail")}??)`}>
          [new email address]
        </Fm.If>
      </Text>
    </Container>

    <Text style={styles.paragraph}>
      To complete this change and verify your new email address, please click the button below:
    </Text>

    <Container style={styles.buttonContainer}>
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
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
                }}
              >
                Verify New Email Address
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

    <Fm.If condition={`${v("link")}??`}>
      <Text style={styles.linkFallback}>
        If the button doesn't work, copy and paste this link into your browser:
        <br />
        {exp("link")}
      </Text>
    </Fm.If>

    <Container style={styles.expirationBox}>
      <Text style={styles.expirationText}>
        This link will expire in{" "}
        <Fm.If condition={`${v("linkExpiration")}??`}>
          {exp("linkExpirationFormatter(linkExpiration)")}
        </Fm.If>
        <Fm.If condition={`!(${v("linkExpiration")}??)`}>
          a limited time
        </Fm.If>
      </Text>
    </Container>

    <Hr style={styles.divider} />

    <Container style={styles.warningBox}>
      <Text style={styles.warningText}>
        <strong>Important Security Notice</strong>
        <br /><br />
        If you did not request this email change, please ignore this message and your email address will remain unchanged.
        For your security, we recommend changing your password immediately if you suspect unauthorized access.
      </Text>
    </Container>

    <Text style={{ ...styles.paragraph, fontSize: "14px", color: "#6b7280", marginTop: "24px" }}>
      This is an automated security notification to protect your account.
    </Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (_props) => {
  return "Verify Your New Email Address";
};
