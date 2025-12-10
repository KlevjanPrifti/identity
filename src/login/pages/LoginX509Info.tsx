import { Shield } from "lucide-react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button, Field, FieldLabel } from "@/components/ui";
import { TemplateContent, TemplateFooter } from "@/login/TemplateComponents";

export default function LoginX509Info(props: PageProps<Extract<KcContext, { pageId: "login-x509-info.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { url, x509 } = kcContext;
  const { msg, msgStr } = i18n;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      headerNode={msg("doLogIn")}
    >
      <TemplateContent className="space-y-6">
        <form id="kc-x509-login-info" action={url.loginAction} method="post" className="space-y-6">
          <Field>
            <FieldLabel htmlFor="certificate_subjectDN">{msg("clientCertificate")}</FieldLabel>
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
              <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <span id="certificate_subjectDN" className="text-sm font-mono break-all">
                {x509.formData.subjectDN || msg("noCertificate")}
              </span>
            </div>
          </Field>

          {x509.formData.isUserEnabled && (
            <Field>
              <FieldLabel htmlFor="username">{msg("doX509Login")}</FieldLabel>
              <div className="p-4 border rounded-lg bg-muted/50">
                <span id="username" className="text-sm font-medium">
                  {x509.formData.username}
                </span>
              </div>
            </Field>
          )}
        </form>
      </TemplateContent>
      <TemplateFooter className="flex flex-row gap-3 justify-end">
        {x509.formData.isUserEnabled && (
          <Button type="submit" form="kc-x509-login-info" name="cancel" id="kc-cancel" variant="outline">
            {msgStr("doIgnore")}
          </Button>
        )}
        <Button type="submit" form="kc-x509-login-info" name="login" id="kc-login">
          {msgStr("doContinue")}
        </Button>
      </TemplateFooter>
    </Template>
  );
}

