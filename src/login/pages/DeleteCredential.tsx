import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button } from "@/components/ui";
import { TemplateContent, TemplateFooter } from "@/login/TemplateComponents";

export default function DeleteCredential(props: PageProps<Extract<KcContext, { pageId: "delete-credential.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { msgStr, msg } = i18n;
  const { url, credentialLabel } = kcContext;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={false}
      headerNode={msg("deleteCredentialTitle", credentialLabel)}
    >
      <TemplateContent className="space-y-6">
        <div id="kc-delete-text" className="text-sm text-muted-foreground">
          {msg("deleteCredentialMessage", credentialLabel)}
        </div>
      </TemplateContent>
      <TemplateFooter className="flex flex-row gap-3 justify-end">
        <form action={url.loginAction} method="POST" className="flex gap-3">
          <Button type="submit" name="cancel-aia" id="kc-decline" variant="outline">
            {msgStr("doCancel")}
          </Button>
          <Button type="submit" name="accept" id="kc-accept" variant="destructive">
            {msgStr("doConfirmDelete")}
          </Button>
        </form>
      </TemplateFooter>
    </Template>
  );
}

