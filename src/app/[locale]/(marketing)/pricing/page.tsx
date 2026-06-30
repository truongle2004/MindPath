import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PricingTableSection } from '@/components/PricingTableSection';

type PricingPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PricingPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'PricingPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function PricingPage(props: PricingPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'PricingPage',
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('page_title')}</h1>
          <p className="max-w-2xl text-muted-foreground">{t('page_description')}</p>
        </section>

        <PricingTableSection />
      </div>
    </main>
  );
}
