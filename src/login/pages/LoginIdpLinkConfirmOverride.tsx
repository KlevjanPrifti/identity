import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button } from "@/components/ui";
import { TemplateContent } from "@/login/TemplateComponents";

export default function LoginIdpLinkConfirmOverride(
  props: PageProps<Extract<KcContext, { pageId: "login-idp-link-confirm-override.ftl" }>, I18n>
) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { url, idpDisplayName } = kcContext;
  const { msg } = i18n;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      headerNode={msg("confirmOverrideIdpTitle")}
    >
      <TemplateContent className="space-y-4">
        <form id="kc-register-form" action={url.loginAction} method="post" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {msg("pageExpiredMsg1")}{" "}
            <a id="loginRestartLink" href={url.loginRestartFlowUrl} className="underline underline-offset-4">
              {msg("doClickHere")}
            </a>
          </p>
          <Button
            type="submit"
            name="submitAction"
            id="confirmOverride"
            value="confirmOverride"
            className="w-full"
          >
            {msg("confirmOverrideIdpContinue", idpDisplayName)}
          </Button>
        </form>
      </TemplateContent>
    </Template>
  );
}

