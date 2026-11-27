import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

// Admin client components need the admin translations, which public pages
// don't receive (see src/app/[locale]/layout.tsx).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
