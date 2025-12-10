import { Text, render, Container, } from "jsx-email";
import { EmailLayout } from "../layout";
import * as Fm from "keycloakify-emails/jsx-email";
import type { GetSubject, GetTemplate, GetTemplateProps } from "keycloakify-emails";
import { createVariablesHelper } from "keycloakify-emails/variables";

interface TemplateProps extends Omit<GetTemplateProps, "plainText"> {}

const paragraph = {
  color: "#475066",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  margin: "16px 0",
};

const linkStyle = { color: "#1f6feb" };

export const previewProps: TemplateProps = {
  locale: "en",
  themeName: "keycloak-custom",
};
export const templateName = "Org Invite";

const { exp, v } = createVariablesHelper("org-invite.ftl");
// Use centralized helper for logo selection
import { getLogo } from "../getLogo";
const { logoSrc, clientName } = getLogo(exp, import.meta.isJsxEmailPreview);

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview={`Invitation to join organization`} locale={locale} logoUrl={logoSrc} logoAlt={`${clientName} Logo`}>
    
    <Text style={paragraph}>
      <Fm.If condition={`${v("firstName")}?? && ${v("lastName")}??`}>
        <p>
          Hi, {exp("firstName" as any)} {exp("lastName" as any)}.
        </p>
      </Fm.If>

      <p>
        You were invited to join the {exp("organization.name" as any)} organization. Click the
        link below to join.
      </p>

      <p>
        <Container>
          <a href={exp("link" as any)} style={linkStyle}>
            Join organization
          </a>
        </Container>
      </p>

      <p>
        This link will expire within {exp("linkExpirationFormatter(linkExpiration)" as any)}.
      </p>

      <p>If you don't want to join the organization, just ignore this message.</p>
    </Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (_props) => {
  return "Invitation to join the {0} organization";
};
