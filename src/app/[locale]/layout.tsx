import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getServerConsent } from "@/lib/consent/consent-server";
import Script from "next/script";
import { Fraunces, Gabarito } from "next/font/google";
import { ConsentBanner } from "@/components/public/legal/consent-banner";

const frauncesSerif = Fraunces({
  variable: "--font-fraunces-serif",
  subsets: ["latin"],
});

const gabaritoSans = Gabarito({
  variable: "--font-gabarito-sans",
  subsets: ["latin"],
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const consent = await getServerConsent();

  return (
    <html
      lang={locale}
      className={`${frauncesSerif.variable} ${gabaritoSans.variable}`}
    >
      <body>
        {consent === "accepted" && process.env.NEXT_PUBLIC_GTM_ID && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`}
          </Script>
        )}

        <NextIntlClientProvider messages={messages}>
          <Navbar locale={locale} />
          <main id="main-content">{children}</main>
          <Footer />
          <ConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
