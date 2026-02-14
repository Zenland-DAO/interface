"use client";

import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

export default function NextIntlProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  // next-intl types are fairly permissive; messages is a plain object.
  messages: Record<string, unknown>;
  children: ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}
