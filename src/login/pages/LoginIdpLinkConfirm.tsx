import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button } from "@/components/ui";
import { TemplateContent } from "@/login/TemplateComponents";

export default function LoginIdpLinkConfirm(props: PageProps<Extract<KcContext, { pageId: "login-idp-link-confirm.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { url, idpAlias } = kcContext;
  const { msg } = i18n;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      headerNode={msg("confirmLinkIdpTitle")}
    >
      <TemplateContent>
        <form id="kc-register-form" action={url.loginAction} method="post" className="space-y-4">
          <Button
            type="submit"
            name="submitAction"
            id="updateProfile"
            value="updateProfile"
            variant="outline"
            className="w-full"
          >
            {msg("confirmLinkIdpReviewProfile")}
          </Button>
          <Button
            type="submit"
            name="submitAction"
            id="linkAccount"
            value="linkAccount"
            className="w-full"
          >
            {msg("confirmLinkIdpContinue", idpAlias)}
          </Button>
        </form>
      </TemplateContent>
    </Template>
  );
}

