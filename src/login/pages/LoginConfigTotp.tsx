import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button, Input, Field, FieldLabel, Checkbox } from "@/components/ui";
import { TemplateContent } from "@/login/TemplateComponents";

export default function LoginConfigTotp(props: PageProps<Extract<KcContext, { pageId: "login-config-totp.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { url, isAppInitiatedAction, totp, mode, messagesPerField } = kcContext;
  const { msg, msgStr, advancedMsg } = i18n;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      headerNode={msg("loginTotpTitle")}
      displayMessage={!messagesPerField.existsError("totp", "userLabel")}
    >
      <TemplateContent className="space-y-6">
        <ol id="kc-totp-settings" className="space-y-4 list-decimal list-outside ml-6 text-sm text-muted-foreground">
          <li className="space-y-2 pl-2">
            <p>{msg("loginTotpStep1")}</p>
            <ul id="kc-totp-supported-apps" className="list-disc list-inside ml-4 space-y-1">
              {totp.supportedApplications.map((app, index) => (
                <li key={index}>{advancedMsg(app)}</li>
              ))}
            </ul>
          </li>

          {mode == "manual" ? (
            <>
              <li className="space-y-2 pl-2">
                <p>{msg("loginTotpManualStep2")}</p>
                <p className="font-mono text-base break-all bg-muted p-3 rounded">
                  <span id="kc-totp-secret-key">{totp.totpSecretEncoded}</span>
                </p>
                <p>
                  <a href={totp.qrUrl} id="mode-barcode" className="underline underline-offset-4">
                    {msg("loginTotpScanBarcode")}
                  </a>
                </p>
              </li>
              <li className="space-y-2 pl-2">
                <p>{msg("loginTotpManualStep3")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li id="kc-totp-type">
                    {msg("loginTotpType")}: {msg(`loginTotp.${totp.policy.type}`)}
                  </li>
                  <li id="kc-totp-algorithm">
                    {msg("loginTotpAlgorithm")}: {totp.policy.getAlgorithmKey()}
                  </li>
                  <li id="kc-totp-digits">
                    {msg("loginTotpDigits")}: {totp.policy.digits}
                  </li>
                  {totp.policy.type === "totp" ? (
                    <li id="kc-totp-period">
                      {msg("loginTotpInterval")}: {totp.policy.period}
                    </li>
                  ) : (
                    <li id="kc-totp-counter">
                      {msg("loginTotpCounter")}: {totp.policy.initialCounter}
                    </li>
                  )}
                </ul>
              </li>
            </>
          ) : (
            <li className="space-y-2 pl-2">
              <p>{msg("loginTotpStep2")}</p>
              <div className="flex justify-center">
                <img
                  id="kc-totp-secret-qr-code"
                  src={`data:image/png;base64, ${totp.totpSecretQrCode}`}
                  alt="Figure: Barcode"
                  className="border rounded"
                />
              </div>
              <p>
                <a href={totp.manualUrl} id="mode-manual" className="underline underline-offset-4">
                  {msg("loginTotpUnableToScan")}
                </a>
              </p>
            </li>
          )}
          <li className="space-y-2 pl-2">
            <p>{msg("loginTotpStep3")}</p>
            <p>{msg("loginTotpStep3DeviceName")}</p>
          </li>
        </ol>

        <form action={url.loginAction} id="kc-totp-settings-form" method="post" className="space-y-4">
          <Field>
            <FieldLabel htmlFor="totp">
              {msg("authenticatorCode")} <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              type="text"
              id="totp"
              name="totp"
              autoComplete="off"
              aria-invalid={messagesPerField.existsError("totp")}
            />
            {messagesPerField.existsError("totp") && (
              <span
                id="input-error-otp-code"
                className="text-destructive text-sm"
                aria-live="polite"
                dangerouslySetInnerHTML={{
                  __html: kcSanitize(messagesPerField.get("totp"))
                }}
              />
            )}
            <input type="hidden" id="totpSecret" name="totpSecret" value={totp.totpSecret} />
            {mode && <input type="hidden" id="mode" value={mode} />}
          </Field>

          <Field>
            <FieldLabel htmlFor="userLabel">
              {msg("loginTotpDeviceName")} {totp.otpCredentials.length >= 1 && <span className="text-destructive">*</span>}
            </FieldLabel>
            <Input
              type="text"
              id="userLabel"
              name="userLabel"
              autoComplete="off"
              aria-invalid={messagesPerField.existsError("userLabel")}
            />
            {messagesPerField.existsError("userLabel") && (
              <span
                id="input-error-otp-label"
                className="text-destructive text-sm"
                aria-live="polite"
                dangerouslySetInnerHTML={{
                  __html: kcSanitize(messagesPerField.get("userLabel"))
                }}
              />
            )}
          </Field>

          <div className="flex items-start space-x-2 p-4 border rounded-lg">
            <Checkbox id="logout-sessions" name="logout-sessions" value="on" defaultChecked={true} />
            <label htmlFor="logout-sessions" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {msg("logoutOtherSessions")}
            </label>
          </div>

          {isAppInitiatedAction ? (
            <div className="flex gap-3">
              <Button type="submit" id="saveTOTPBtn" className="flex-1">
                {msgStr("doSubmit")}
              </Button>
              <Button type="submit" id="cancelTOTPBtn" name="cancel-aia" value="true" variant="outline" className="flex-1">
                {msg("doCancel")}
              </Button>
            </div>
          ) : (
            <Button type="submit" id="saveTOTPBtn" className="w-full">
              {msgStr("doSubmit")}
            </Button>
          )}
        </form>
      </TemplateContent>
    </Template>
  );
}

