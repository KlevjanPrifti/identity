import { render, Text, Container, Hr } from "jsx-email";
import * as Fm from "keycloakify-emails/jsx-email";
import { EmailLayout } from "../layout";
import { createVariablesHelper } from "keycloakify-emails/variables";
import type { GetSubject, GetTemplate, GetTemplateProps } from "keycloakify-emails";

interface TemplateProps extends Omit<GetTemplateProps, "plainText"> { }

const styles = {
  logoContainer: {
    textAlign: "center" as const,
    paddingBottom: "32px",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "40px",
    boxShadow:
      "0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)",
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

  divider: {
    borderColor: "#e5e7eb",
    margin: "32px 0",
  },

  infoBox: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "24px 0",
  },

  infoText: {
    color: "#1e40af",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "0",
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
};

export const previewProps: TemplateProps = {
  locale: "en",
  themeName: "keycloak-custom",
};

export const templateName = "Email Test";

const { exp, v } = createVariablesHelper("email-test.ftl");

// Use centralized helper for logo selection
import { getLogo } from "../getLogo";
const { logoSrc, clientName } = getLogo(exp, import.meta.isJsxEmailPreview);

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview={"SMTP Configuration Test - Action Required"} locale={locale} logoUrl={logoSrc} logoAlt={`${clientName} Logo`}>

    <Container style={styles.card}>
      <Text style={styles.badge}>✓ SYSTEM TEST</Text>

      <Text style={styles.header}>
        Email Configuration Test
      </Text>

      <Text style={styles.paragraph}>
        Hello there,
      </Text>

      <Text style={styles.paragraph}>
        This is a test message to verify your SMTP email configuration is working correctly.
        <Fm.If condition={`${v("realmName")}??`}>
          {" "}This notification was sent from <strong>{exp("realmName")}</strong>.
        </Fm.If>
      </Text>

      <Container style={styles.infoBox}>
        <Text style={styles.infoText}>
          <strong>✓ Success!</strong> If you're reading this, your email system is properly configured
          and ready to send notifications to users.
        </Text>
      </Container>

      <Hr style={styles.divider} />

      <Text style={{ ...styles.paragraph, fontSize: "14px", color: "#6b7280" }}>
        If you did not request this test email, you can safely disregard this message.
        No action is required on your part.
      </Text>
    </Container>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (_props) => {
  return "SMTP Configuration Test - Email System Active";
};
