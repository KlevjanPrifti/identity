import { useState } from "react";
import type { JSX } from "keycloakify/tools/JSX";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button } from "@/components/ui";
import { TemplateContent } from "@/login/TemplateComponents";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";

type IdpReviewUserProfileProps = PageProps<Extract<KcContext, { pageId: "idp-review-user-profile.ftl" }>, I18n> & {
  UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSX.Element>;
  doMakeUserConfirmPassword: boolean;
};

export default function IdpReviewUserProfile(props: IdpReviewUserProfileProps) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes, UserProfileFormFields, doMakeUserConfirmPassword } = props;

  const { kcClsx } = getKcClsx({
    doUseDefaultCss,
    classes
  });

  const { msg, msgStr } = i18n;
  const { url, messagesPerField } = kcContext;
  const [isFormSubmittable, setIsFormSubmittable] = useState(false);

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={messagesPerField.exists("global")}
      displayRequiredFields
      headerNode={msg("loginIdpReviewProfileTitle")}
    >
      <TemplateContent>
        <form id="kc-idp-review-profile-form" action={url.loginAction} method="post" className="space-y-4">
          <UserProfileFormFields
            kcContext={kcContext}
            i18n={i18n}
            onIsFormSubmittableValueChange={setIsFormSubmittable}
            kcClsx={kcClsx}
            doMakeUserConfirmPassword={doMakeUserConfirmPassword}
          />
          <Button type="submit" disabled={!isFormSubmittable} className="w-full">
            {msgStr("doSubmit")}
          </Button>
        </form>
      </TemplateContent>
    </Template>
  );
}

