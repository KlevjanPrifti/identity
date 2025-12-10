import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button } from "@/components/ui";
import { TemplateContent, TemplateFooter } from "@/login/TemplateComponents";

export default function Terms(props: PageProps<Extract<KcContext, { pageId: "terms.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { msg, msgStr } = i18n;
  const { url } = kcContext;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={false}
      headerNode={msg("termsTitle")}
    >
      <TemplateContent className="space-y-6">
        <div id="kc-terms-text" className="prose prose-sm max-w-none text-muted-foreground">
          {msg("termsText")}
        </div>
      </TemplateContent>
      <TemplateFooter className="flex flex-row gap-3 justify-end">
        <form className="flex gap-3" action={url.loginAction} method="POST">
          <Button type="submit" name="cancel" id="kc-decline" variant="outline">
            {msgStr("doDecline")}
          </Button>
          <Button type="submit" name="accept" id="kc-accept">
            {msgStr("doAccept")}
          </Button>
        </form>
      </TemplateFooter>
    </Template>
  );
}

