import { Compass, HeartHandshake, TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/libs/I18nNavigation';

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: AboutPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function AboutPage(props: AboutPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  const values = [
    {
      icon: Compass,
      title: t('value_clarity_title'),
      description: t('value_clarity_description'),
    },
    {
      icon: TrendingUp,
      title: t('value_growth_title'),
      description: t('value_growth_description'),
    },
    {
      icon: HeartHandshake,
      title: t('value_support_title'),
      description: t('value_support_description'),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-0 text-base">
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{t('hero_title')}</h1>
        <p className="max-w-2xl text-muted-foreground">{t('hero_description')}</p>
      </section>

      {/* Mission — muted band */}
      <section className="bg-muted px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-semibold">{t('mission_title')}</h2>
          <p className="max-w-2xl text-muted-foreground">{t('mission_description')}</p>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-16 md:py-24">
        <h2 className="mb-8 text-2xl font-semibold">{t('values_title')}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title}>
              <CardHeader>
                <value.icon aria-hidden className="mb-2 size-5 text-muted-foreground" />
                <CardTitle className="text-lg">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted px-6 py-16 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="mb-2 text-2xl font-semibold">{t('cta_title')}</h2>
          <p className="mb-8 text-muted-foreground">{t('cta_description')}</p>
          <Button asChild>
            <Link href="/sign-up/">{t('cta_button')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
