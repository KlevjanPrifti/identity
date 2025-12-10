import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { buttonVariants } from "@/components/ui";
import { TemplateContent } from "@/login/TemplateComponents";

export default function Info(props: PageProps<Extract<KcContext, { pageId: "info.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { advancedMsgStr, msg } = i18n;
  const { messageHeader, message, requiredActions, skipLink, pageRedirectUri, actionUri, client } = kcContext;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={false}
      headerNode={
        <span
          dangerouslySetInnerHTML={{
            __html: kcSanitize(messageHeader ?? message.summary)
          }}
        />
      }
    >
      <TemplateContent className="space-y-4">
        <div id="kc-info-message" className="space-y-4">
          <p
            className="text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: kcSanitize(
                (() => {
                  let html = message.summary?.trim();

                  if (requiredActions) {
                    html += " <b>";

                    html += requiredActions.map(requiredAction => advancedMsgStr(`requiredAction.${requiredAction}`)).join(", ");

                    html += "</b>";
                  }

                  return html;
                })()
              )
            }}
          />
          {(() => {
            if (skipLink) {
              return null;
            }

            if (pageRedirectUri) {
              return (
                <a href={pageRedirectUri} className={buttonVariants({ variant: "link" })}>
                  {msg("backToApplication")}
                </a>
              );
            }
            if (actionUri) {
              return (
                <a href={actionUri} className={buttonVariants({ variant: "link" })}>
                  {msg("proceedWithAction")}
                </a>
              );
            }

            if (client.baseUrl) {
              return (
                <a href={client.baseUrl} className={buttonVariants({ variant: "link" })}>
                  {msg("backToApplication")}
                </a>
              );
            }
          })()}
        </div>
      </TemplateContent>
    </Template>
  );
}

