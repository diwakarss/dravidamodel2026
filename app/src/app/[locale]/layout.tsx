import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { fraunces, notoSansTamil, sourceSans } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Dravida Model Showcase 2021-26",
  description:
    "Tracking 150+ government infrastructure projects with transparent, verifiable sourcing.",
  metadataBase: new URL("https://dravidamodel2026.top"),
  openGraph: {
    title: "Dravida Model 2021–2026",
    description:
      "Tamil Nadu Development Initiatives: 150+ projects across 38 districts with 100% source-backed data.",
    url: "https://dravidamodel2026.top",
    siteName: "Dravida Model Showcase",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dravida Model 2021-2026 - Tamil Nadu Development Initiatives",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dravida Model 2021–2026",
    description:
      "Tamil Nadu Development Initiatives: 150+ projects across 38 districts.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
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
