"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import {
  FormField,
  TextInput,
  TextArea,
  PrimaryButton,
} from "@/components/form/form-field";
import {
  ContactFormState,
  sendContactEmail,
} from "@/app/[locale]/(public)/contact/actions";

const initialState: ContactFormState = {};

export default function ContactForm() {
  const t = useTranslations("public.contact");
  const [state, formAction, isPending] = useActionState(
    sendContactEmail,
    initialState,
  );

  return (
    <div className="rounded-sm border border-amber-500/30 bg-card p-4 md:p-6 sm:p-8">
      {state.success ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="mb-4 h-12 w-12 text-amber-500" />
          <h3 className="font-display text-2xl font-bold uppercase text-foreground">
            {t("success.title")}
          </h3>
          <p className="mt-2 font-body text-sm text-muted-foreground max-w-md">
            {t("success.description")}
          </p>
        </div>
      ) : (
        <form action={formAction} className="space-y-6">
          {state.error && (
            <div className="flex items-center gap-2 rounded-sm border border-red-500/40 bg-red-500/10 p-4 font-mono text-xs text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField label={`${t("form.name")} *`}>
              {(id) => (
                <TextInput
                  id={id}
                  type="text"
                  name="name"
                  placeholder={t("form.namePlaceholder")}
                  required
                />
              )}
            </FormField>

            <FormField label={`${t("form.email")} *`}>
              {(id) => (
                <TextInput
                  id={id}
                  type="email"
                  name="email"
                  placeholder={t("form.emailPlaceholder")}
                  required
                />
              )}
            </FormField>
          </div>

          <FormField label={t("form.subject")}>
            {(id) => (
              <TextInput
                id={id}
                type="text"
                name="subject"
                placeholder={t("form.subjectPlaceholder")}
              />
            )}
          </FormField>

          <FormField label={`${t("form.message")} *`}>
            {(id) => (
              <TextArea
                id={id}
                name="message"
                rows={5}
                placeholder={t("form.messagePlaceholder")}
                required
              />
            )}
          </FormField>

          <PrimaryButton
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center gap-2 py-3.5 font-mono text-xs uppercase tracking-widest cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>{isPending ? t("form.submitting") : t("form.submit")}</span>
          </PrimaryButton>
        </form>
      )}
    </div>
  );
}
