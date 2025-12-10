import { MouseEvent, useRef, useState } from "react";
import { Building2 } from "lucide-react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "@/login/KcContext";
import type { I18n } from "@/login/i18n";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Field, FieldLabel } from "@/components/ui";
import { TemplateContent } from "@/login/TemplateComponents";

export default function SelectOrganization(props: PageProps<Extract<KcContext, { pageId: "select-organization.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { url, user } = kcContext;
  const { msg } = i18n;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const organizationInputRef = useRef<HTMLInputElement>(null);

  const onOrganizationClick = (organizationAlias: string) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!organizationInputRef.current || !formRef.current) {
      return;
    }

    organizationInputRef.current.value = organizationAlias;
    setIsSubmitting(true);

    if (typeof formRef.current.requestSubmit === "function") {
      formRef.current.requestSubmit();
      return;
    }

    formRef.current.submit();
  };

  const onSelectChange = (value: string) => {
    setSelectedOrg(value);
    if (!organizationInputRef.current || !formRef.current) {
      return;
    }

    organizationInputRef.current.value = value;
    setIsSubmitting(true);

    if (typeof formRef.current.requestSubmit === "function") {
      formRef.current.requestSubmit();
      return;
    }

    formRef.current.submit();
  };

  const organizations = user.organizations ?? [];
  const useSelect = organizations.length > 3;

  return (
    <Template kcContext={kcContext} i18n={i18n} doUseDefaultCss={doUseDefaultCss} classes={classes} headerNode={null}>
      <TemplateContent className="space-y-6">
        <form ref={formRef} action={url.loginAction} method="post" className="space-y-6">
          <div id="kc-user-organizations" className="space-y-4">
            <h2 className="text-2xl font-semibold">{msg("organization.select")}</h2>
            {useSelect ? (
              <Field>
                <FieldLabel>{msg("organization.select")}</FieldLabel>
                <Select value={selectedOrg} onValueChange={onSelectChange} disabled={isSubmitting}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={msg("organization.select")} />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map(({ alias, name }) => (
                      <SelectItem key={alias} value={alias}>
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {name ?? alias}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : (
              <ul className="space-y-3">
                {organizations.map(({ alias, name }) => (
                  <li key={alias}>
                    <Button
                      id={`organization-${alias}`}
                      type="button"
                      variant="outline"
                      onClick={onOrganizationClick(alias)}
                      disabled={isSubmitting}
                      className="w-full h-auto p-4 flex items-center gap-3 justify-start hover:bg-accent hover:border-primary transition-colors"
                    >
                      <Building2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm">{name ?? alias}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input ref={organizationInputRef} type="hidden" name="kc.org" />
        </form>
      </TemplateContent>
    </Template>
  );
}

