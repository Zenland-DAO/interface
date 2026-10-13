import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales, type Locale } from "@/i18n/config";
import { RootDocument, rootMetadata } from "@/components/layout/RootDocument";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export const metadata = rootMetadata;

/**
 * Message namespaces that client components on marketing pages read.
 * Everything else (e.g. `legal`) is only used by server components, so it is
 * kept out of the client payload.
 */
const CLIENT_NAMESPACES = ["common", "marketing"] as const;

/**
 * Locale Layout (root layout for marketing pages)
 *
 * Wraps all localized routes (marketing pages) with NextIntlClientProvider.
 * Validates the locale parameter and provides translation context.
 */
export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Get messages for the current locale
  const messages = await getMessages();
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.map((namespace) => [namespace, messages[namespace]]),
  );

  return (
    <RootDocument locale={locale}>
      <NextIntlClientProvider messages={clientMessages} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    </RootDocument>
  );
}

/**
 * Generate static params for all supported locales
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
