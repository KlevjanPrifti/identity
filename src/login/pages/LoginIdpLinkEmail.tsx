import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { TemplateContent } from "@/login/TemplateComponents";

export default function LoginIdpLinkEmail(props: PageProps<Extract<KcContext, { pageId: "login-idp-link-email.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { url, realm, brokerContext, idpAlias } = kcContext;
  const { msg } = i18n;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      headerNode={msg("emailLinkIdpTitle", idpAlias)}
    >
      <TemplateContent className="space-y-4">
        <p id="instruction1" className="text-sm text-muted-foreground">
          {msg("emailLinkIdp1", idpAlias, brokerContext.username, realm.displayName)}
        </p>
        <p id="instruction2" className="text-sm text-muted-foreground">
          {msg("emailLinkIdp2")}{" "}
          <a href={url.loginAction} className="underline underline-offset-4">
            {msg("doClickHere")}
          </a>{" "}
          {msg("emailLinkIdp3")}
        </p>
        <p id="instruction3" className="text-sm text-muted-foreground">
          {msg("emailLinkIdp4")}{" "}
          <a href={url.loginAction} className="underline underline-offset-4">
            {msg("doClickHere")}
          </a>{" "}
          {msg("emailLinkIdp5")}
        </p>
      </TemplateContent>
    </Template>
  );
}
