import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button, Input, Field, FieldLabel } from "@/components/ui";
import { TemplateContent, TemplateFooter } from "@/login/TemplateComponents";

export default function LoginResetPassword(props: PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { url, realm, auth, messagesPerField } = kcContext;
  const { msg, msgStr } = i18n;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={!messagesPerField.existsError("username")}
      headerNode={msg("emailForgotTitle")}
    >
      <TemplateContent>
        <form id="kc-reset-password-form" className="flex flex-col gap-4" action={url.loginAction} method="post">
          <Field>
            <FieldLabel htmlFor="username">
              {!realm.loginWithEmailAllowed ? msg("username") : !realm.registrationEmailAsUsername ? msg("usernameOrEmail") : msg("email")}
            </FieldLabel>
            <Input
              type="text"
              id="username"
              name="username"
              defaultValue={auth.attemptedUsername ?? ""}
              aria-invalid={messagesPerField.existsError("username")}
              required
            />
            {messagesPerField.existsError("username") && (
              <span
                className="text-destructive text-sm"
                dangerouslySetInnerHTML={{
                  __html: kcSanitize(messagesPerField.get("username"))
                }}
              />
            )}
          </Field>
          <Button type="submit" className="w-full">
            {msgStr("doSubmit")}
          </Button>
        </form>
      </TemplateContent>
      <TemplateFooter className="flex-col gap-2">
        <Button variant="link" className="w-full text-sm" asChild>
          <a href={url.loginUrl}>{msg("backToLogin")}</a>
        </Button>
      </TemplateFooter>
    </Template>
  );
}
