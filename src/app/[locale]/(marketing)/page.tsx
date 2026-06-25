import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Sponsors } from '@/components/Sponsors';

type IndexPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IndexPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return (
    <>
      <p className="text-base">
        MindPath is built with Next.js, TypeScript, Tailwind CSS, and Clerk authentication.{' '}
        {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
        <span role="img" aria-label={t('zap_emoji_label')}>
          ⚡️
        </span>
      </p>
      <h2 className="mt-5 text-2xl font-bold">Built for real product development</h2>
      <ul className="mt-3 text-base">
        <li>🚀 Next.js with App Router support</li>
        <li>🔥 TypeScript for type checking</li>
        <li>💎 Tailwind CSS integration</li>
        <li>
          🔒 Authentication with{' '}
          <a
            className="font-bold text-blue-700 hover:border-b-2 hover:border-blue-700"
            href="https://clerk.com"
          >
            Clerk
          </a>
        </li>
        <li>📦 ORM with DrizzleORM and PostgreSQL</li>
        <li>💽 Local PostgreSQL with Docker Compose</li>
        <li>🌐 Multi-language support (i18n) with next-intl</li>
        <li>🔴 Form handling (React Hook Form) and validation (Zod)</li>
        <li>🚨 Error monitoring with Sentry</li>
        <li>🔐 Security and bot protection with Arcjet</li>
      </ul>
      <h2 className="mt-5 text-2xl font-bold">{t('sponsors_title')}</h2>
      <Sponsors />
    </>
  );
}
