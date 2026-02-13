import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { fraunces, notoSansTamil, sourceSans } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Tamil Nadu Infrastructure Showcase",
  description:
    "Tracking 150+ government infrastructure projects with transparent, verifiable sourcing.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

async function getMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch {
    return (await import(`../../messages/ta.json`)).default;
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${notoSansTamil.variable} ${sourceSans.variable}`}
    >
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
