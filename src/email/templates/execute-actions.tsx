import { render, Text, Container, Button, Hr } from "jsx-email";
import * as Fm from "keycloakify-emails/jsx-email";
import { GetSubject, GetTemplate, GetTemplateProps } from "keycloakify-emails";
import { ReactNode } from "react";
import { createVariablesHelper } from "keycloakify-emails/variables";
import { EmailLayout } from "../layout";

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

  alertBox: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "24px 0",
  },

  alertText: {
    color: "#92400e",
    fontSize: "15px",
    lineHeight: "22px",
    margin: "0",
  },

  actionsBox: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    padding: "20px 24px",
    margin: "24px 0",
  },

  actionsHeader: {
    color: "#0c4a6e",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 16px 0",
  },

  actionsList: {
    margin: "0",
    paddingLeft: "24px",
  },

  actionItem: {
    color: "#0369a1",
    fontSize: "15px",
    lineHeight: "28px",
    fontWeight: "500",
  },

  buttonContainer: {
    textAlign: "center" as const,
    margin: "32px 0",
  },

  button: {
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "14px 32px",
    borderRadius: "8px",
    display: "inline-block",
    boxShadow: "0 2px 4px rgba(245, 158, 11, 0.3)",
  },

  divider: {
    borderColor: "#e5e7eb",
    margin: "32px 0",
  },

  expirationBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "12px 16px",
    margin: "20px 0",
    textAlign: "center" as const,
  },

  expirationText: {
    color: "#991b1b",
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

  infoBox: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "24px 0",
  },

  infoText: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "0",
  },
};

// Helper component to create a Freemarker expression for the list
const FmList = (props: { value: string; itemAs: string; children: ReactNode }) => (
  <>
    <Fm.Tag name="list" attributes={props.value}>
      <Fm.Tag name="items" attributes={`as ${props.itemAs}`}>
        {props.children}
      </Fm.Tag>
    </Fm.Tag>
  </>
);

const { exp, v } = createVariablesHelper("executeActions.ftl");
// Use centralized helper for logo selection
import { getLogo } from "../getLogo";
const { logoSrc, clientName } = getLogo(exp, import.meta.isJsxEmailPreview);

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview="Account update required by administrator" locale={locale} logoUrl={logoSrc} logoAlt={`${clientName} Logo`}>
    

    <Text style={styles.badge}>ADMIN REQUEST</Text>

    <Text style={styles.header}>
      Account Update Required
    </Text>

    <Container style={styles.alertBox}>
      <Text style={styles.alertText}>
        <strong>Administrator Notice</strong>
        <br /><br />
        Your administrator has requested that you update your{" "}
        <Fm.If condition={`${v("realmName")}??`}>
          <strong>{exp("realmName")}</strong>
        </Fm.If>
        <Fm.If condition={`!(${v("realmName")}??)`}>
          account
        </Fm.If>
        {" "}by completing the following required actions.
      </Text>
    </Container>

    <Fm.If condition="requiredActions??">
      <Container style={styles.actionsBox}>
        <Text style={styles.actionsHeader}>
          ✓ Required Actions:
        </Text>
        <ul style={styles.actionsList}>
          <FmList value="requiredActions" itemAs="reqActionItem">
            <li style={styles.actionItem}>
              <Fm.If condition={`reqActionItem == 'UPDATE_PASSWORD'`}>
                Update Password
              </Fm.If>
              <Fm.If condition={`reqActionItem == 'UPDATE_PROFILE'`}>
                Update Profile
              </Fm.If>
              <Fm.If condition={`reqActionItem == 'TERMS_AND_CONDITIONS'`}>
                Accept Terms and Conditions
              </Fm.If>
              <Fm.If condition={`reqActionItem == 'CONFIGURE_TOTP'`}>
                Configure Two-Factor Authentication
              </Fm.If>
              <Fm.If condition={`reqActionItem == 'VERIFY_EMAIL'`}>
                Verify Email Address
              </Fm.If>
              <Fm.If condition={`reqActionItem == 'CONFIGURE_RECOVERY_AUTHN_CODES'`}>
                Generate Recovery Codes
              </Fm.If>
            </li>
          </FmList>
        </ul>
      </Container>
    </Fm.If>

    <Text style={styles.paragraph}>
      Click the button below to begin the update process. You'll be guided through each required action step by step.
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
          Update link unavailable
        </Text>
      </Fm.If>
    </Container>

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

    <Container style={styles.infoBox}>
      <Text style={styles.infoText}>
        <strong>Didn't expect this?</strong>
        <br /><br />
        If you're unaware that your administrator requested these updates, you can safely ignore this message.
        No changes will be made to your account unless you complete the actions using the link above.
      </Text>
    </Container>

    <Text style={{ ...styles.paragraph, fontSize: "14px", color: "#6b7280", marginTop: "24px" }}>
      This is an administrative notification regarding your account status.
    </Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const previewProps: TemplateProps = {
  locale: "en",
  themeName: "keycloak-custom",
};

export const templateName = "Execute Actions";

export const getSubject: GetSubject = async (_props) => {
  return "Action Required: Update Your Account";
};
