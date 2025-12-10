import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button } from "@/components/ui";
import { TemplateContent, TemplateFooter } from "@/login/TemplateComponents";

export default function LoginVerifyEmail(props: PageProps<Extract<KcContext, { pageId: "login-verify-email.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { msg } = i18n;
  const { url, user } = kcContext;

  return (
    <Template kcContext={kcContext} i18n={i18n} doUseDefaultCss={doUseDefaultCss} classes={classes} displayInfo headerNode={msg("emailVerifyTitle")}>
      <TemplateContent>
        <p className="text-sm text-muted-foreground">{msg("emailVerifyInstruction1", user?.email ?? "")}</p>
      </TemplateContent>
      <TemplateFooter className="flex items-center gap-2">
        <Button asChild>
          <a href={url.loginAction}>{msg("doClickHere")}</a>
        </Button>
        <p className="text-sm text-muted-foreground">{msg("emailVerifyInstruction3")}</p>
      </TemplateFooter>
    </Template>
  );
}
