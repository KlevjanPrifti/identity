import { AlertTriangle } from "lucide-react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button } from "@/components/ui";
import { TemplateContent, TemplateFooter } from "@/login/TemplateComponents";

export default function DeleteAccountConfirm(
  props: PageProps<Extract<KcContext, { pageId: "delete-account-confirm.ftl" }>, I18n>
) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { url, triggered_from_aia } = kcContext;
  const { msg, msgStr } = i18n;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      headerNode={msg("deleteAccountConfirm")}
    >
      <TemplateContent className="space-y-6">
        <form action={url.loginAction} method="post" id="kc-delete-account-form" className="space-y-6">
          <div className="flex items-start gap-3 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-900 dark:text-yellow-100">{msg("irreversibleAction")}</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{msg("deletingImplies")}</p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-sm text-muted-foreground">
              <li>{msg("loggingOutImmediately")}</li>
              <li>{msg("errasingData")}</li>
            </ul>
            <p className="text-sm font-medium">{msg("finalDeletionConfirmation")}</p>
          </div>
        </form>
      </TemplateContent>
      <TemplateFooter className="flex flex-row gap-3 justify-end">
        {triggered_from_aia && (
          <Button type="submit" form="kc-delete-account-form" name="cancel-aia" value="true" variant="outline">
            {msgStr("doCancel")}
          </Button>
        )}
        <Button type="submit" form="kc-delete-account-form" variant="destructive">
          {msgStr("doConfirmDelete")}
        </Button>
      </TemplateFooter>
    </Template>
  );
}

