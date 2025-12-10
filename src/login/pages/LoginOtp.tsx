import { useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem, Field, FieldLabel } from "@/components/ui";
import { TemplateContent } from "@/login/TemplateComponents";
import { Smartphone } from "lucide-react";

export default function LoginOtp(props: Readonly<PageProps<Extract<KcContext, { pageId: "login-otp.ftl" }>, I18n>>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { otpLogin, url, messagesPerField } = kcContext;
  const { msg, msgStr } = i18n;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasError = messagesPerField.existsError("totp");
  const errorMessage = hasError ? messagesPerField.get("totp") : "";
  const [selectedCredentialId, setSelectedCredentialId] = useState(otpLogin.selectedCredentialId ?? otpLogin.userOtpCredentials[0]?.id);

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={!messagesPerField.existsError("totp")}
      headerNode={msg("doLogIn")}
    >
      <TemplateContent>
        <form
          id="kc-otp-login-form"
          className="flex flex-col gap-4"
          action={url.loginAction}
          onSubmit={() => {
            setIsSubmitting(true);
            return true;
          }}
          method="post"
        >
          {/* OTP Credential Selection */}
          {otpLogin.userOtpCredentials.length > 1 && (
            <div className="space-y-3">
              {otpLogin.userOtpCredentials.length <= 3 ? (
                // Show radio buttons for 3 or fewer devices
                <RadioGroup value={selectedCredentialId} onValueChange={setSelectedCredentialId} className="space-y-2">
                  {otpLogin.userOtpCredentials.map((otpCredential, index) => (
                    <div key={otpCredential.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={otpCredential.id} id={`kc-otp-credential-${index}`} />
                      <input type="hidden" name="selectedCredentialId" value={selectedCredentialId} />
                      <Label htmlFor={`kc-otp-credential-${index}`} className="flex items-center space-x-3 cursor-pointer flex-1">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <Smartphone className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{otpCredential.userLabel || `Device ${index + 1}`}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                // Show dropdown for more than 3 devices
                <div className="space-y-2">
                  <Select value={selectedCredentialId} onValueChange={setSelectedCredentialId}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center space-x-2">
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {otpLogin.userOtpCredentials.map((otpCredential, index) => (
                        <SelectItem key={otpCredential.id} value={otpCredential.id}>
                          <div className="flex items-center space-x-3">
                            <div className="p-1 bg-primary/10 rounded">
                              <Smartphone className="size-3 text-primary" />
                            </div>
                            <div className="font-medium text-sm">{otpCredential.userLabel || `Device ${index + 1}`}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="selectedCredentialId" value={selectedCredentialId} />
                </div>
              )}
            </div>
          )}

          {/* OTP Input */}
          <Field>
            <FieldLabel htmlFor="otp">
              {msg("loginOtpOneTime")}
            </FieldLabel>
            <InputOTP maxLength={6} name="otp" autoComplete="off" aria-invalid={hasError}>
              <InputOTPGroup className="w-full">
                <InputOTPSlot className="flex-1" index={0} />
                <InputOTPSlot className="flex-1" index={1} />
                <InputOTPSlot className="flex-1" index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="w-full">
                <InputOTPSlot className="flex-1" index={3} />
                <InputOTPSlot className="flex-1" index={4} />
                <InputOTPSlot className="flex-1" index={5} />
              </InputOTPGroup>
            </InputOTP>
            {hasError && (
              <span
                aria-live="polite"
                id="input-error-otp-code"
                className="text-destructive text-sm"
                dangerouslySetInnerHTML={{
                  __html: kcSanitize(errorMessage)
                }}
              />
            )}
          </Field>

          <Button type="submit" name="login" className="w-full" disabled={isSubmitting} id="kc-login">
            {msgStr("doLogIn")}
          </Button>
        </form>
      </TemplateContent>
    </Template>
  );
}
