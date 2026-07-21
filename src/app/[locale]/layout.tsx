import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';
import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '@/styles/global.css';
import { QueryProvider } from '@/components/QueryProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ClerkLocalizations } from '@/lib/AppConfig';
import { routing } from '@/lib/I18nRouting';

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const clerkLocale =
    ClerkLocalizations.supportedLocales[locale] ?? ClerkLocalizations.defaultLocale;

  return (
    <ClerkProvider
      appearance={{
        theme: shadcn,
      }}
      localization={clerkLocale}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/"
    >
      <html lang={locale} suppressHydrationWarning>
        <body>
          <NextIntlClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <QueryProvider>{props.children}</QueryProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
