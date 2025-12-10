import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { ChevronRight, Smartphone, Key, LockOpen, List } from "lucide-react";
import { TemplateContent } from "@/login/TemplateComponents";

export default function SelectAuthenticator(props: PageProps<Extract<KcContext, { pageId: "select-authenticator.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { url, auth } = kcContext;

  const { msg, advancedMsg } = i18n;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayInfo={false}
      headerNode={msg("loginChooseAuthenticator")}
    >
      <TemplateContent>
        <form id="kc-select-credential-form" action={url.loginAction} method="post" className="space-y-3">
          {auth.authenticationSelections.map((authenticationSelection, i) => (
            <button
              key={i}
              type="submit"
              name="authenticationExecution"
              value={authenticationSelection.authExecId}
              className="w-full flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors text-left"
            >
              <div className="flex-shrink-0">
                {authenticationSelection.iconCssClass === "kcAuthenticatorOTPClass" ? (
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                ) : authenticationSelection.iconCssClass === "kcAuthenticatorPasswordClass" ? (
                  <LockOpen className="w-5 h-5 text-muted-foreground" />
                ) : authenticationSelection.iconCssClass === "kcAuthenticatorWebAuthnClass" ||
                  authenticationSelection.iconCssClass === "kcAuthenticatorWebAuthnPasswordlessClass" ? (
                  <Key className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <List className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm mb-1">{advancedMsg(authenticationSelection.displayName)}</div>
                <div className="text-xs text-muted-foreground">{advancedMsg(authenticationSelection.helpText)}</div>
              </div>
              <div className="flex-shrink-0">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          ))}
        </form>
      </TemplateContent>
    </Template>
  );
}

