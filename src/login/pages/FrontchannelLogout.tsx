import { useEffect, useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { buttonVariants } from "@/components/ui";
import { TemplateContent, TemplateFooter } from "@/login/TemplateComponents";

export default function FrontchannelLogout(props: PageProps<Extract<KcContext, { pageId: "frontchannel-logout.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { logout } = kcContext;
  const { msg, msgStr } = i18n;

  const [iframeLoadCount, setIframeLoadCount] = useState(0);

  useEffect(() => {
    if (!kcContext.logout.logoutRedirectUri) {
      return;
    }

    if (iframeLoadCount !== kcContext.logout.clients.length) {
      return;
    }

    window.location.replace(kcContext.logout.logoutRedirectUri);
  }, [iframeLoadCount, kcContext.logout.logoutRedirectUri, kcContext.logout.clients.length]);

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      documentTitle={msgStr("frontchannel-logout.title")}
      headerNode={msg("frontchannel-logout.title")}
    >
      <TemplateContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{msg("frontchannel-logout.message")}</p>
        {logout.clients.length > 0 && (
          <ul className="list-disc list-inside ml-4 space-y-2 text-sm text-muted-foreground">
            {logout.clients.map((client, index) => (
              <li key={index}>
                {client.name}
                <iframe
                  src={client.frontChannelLogoutUrl}
                  style={{ display: "none" }}
                  onLoad={() => {
                    setIframeLoadCount(count => count + 1);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </TemplateContent>
      {logout.logoutRedirectUri !== undefined && (
        <TemplateFooter>
          <a id="continue" href={logout.logoutRedirectUri} className={buttonVariants({ variant: "default" })}>
            {msg("doContinue")}
          </a>
        </TemplateFooter>
      )}
    </Template>
  );
}

