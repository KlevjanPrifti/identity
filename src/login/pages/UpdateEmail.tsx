import { useState } from "react";
import type { JSX } from "keycloakify/tools/JSX";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button, Checkbox } from "@/components/ui";
import { TemplateContent, TemplateFooter } from "@/login/TemplateComponents";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";

type UpdateEmailProps = PageProps<Extract<KcContext, { pageId: "update-email.ftl" }>, I18n> & {
  UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSX.Element>;
  doMakeUserConfirmPassword: boolean;
};

export default function UpdateEmail(props: UpdateEmailProps) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes, UserProfileFormFields, doMakeUserConfirmPassword } = props;

  const { kcClsx } = getKcClsx({
    doUseDefaultCss,
    classes
  });

  const { msg, msgStr } = i18n;
  const { url, messagesPerField, isAppInitiatedAction } = kcContext;
  const [isFormSubmittable, setIsFormSubmittable] = useState(false);

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={messagesPerField.exists("global")}
      displayRequiredFields
      headerNode={msg("updateEmailTitle")}
    >
      <TemplateContent>
        <form id="kc-update-email-form" action={url.loginAction} method="post" className="space-y-4">
          <UserProfileFormFields
            kcContext={kcContext}
            i18n={i18n}
            kcClsx={kcClsx}
            onIsFormSubmittableValueChange={setIsFormSubmittable}
            doMakeUserConfirmPassword={doMakeUserConfirmPassword}
          />

          <div className="flex items-start space-x-2 p-4 border rounded-lg">
            <Checkbox id="logout-sessions" name="logout-sessions" value="on" defaultChecked={true} />
            <label htmlFor="logout-sessions" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {msg("logoutOtherSessions")}
            </label>
          </div>
        </form>
      </TemplateContent>
      <TemplateFooter className="flex-col gap-2">
        <Button
          type="submit"
          form="kc-update-email-form"
          disabled={!isFormSubmittable}
          className="w-full"
        >
          {msgStr("doSubmit")}
        </Button>
        {isAppInitiatedAction && (
          <Button
            type="submit"
            form="kc-update-email-form"
            name="cancel-aia"
            value="true"
            variant="outline"
            className="w-full"
          >
            {msg("doCancel")}
          </Button>
        )}
      </TemplateFooter>
    </Template>
  );
}

