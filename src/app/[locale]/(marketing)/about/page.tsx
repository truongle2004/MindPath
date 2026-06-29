import { Compass, HeartHandshake, TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/libs/I18nNavigation';
import crowdinLogo from '@/public/assets/images/crowdin-dark.png';

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

  const techStack = [
    t('tech_nextjs'),
    t('tech_typescript'),
    t('tech_tailwind'),
    t('tech_clerk'),
    t('tech_postgresql'),
    t('tech_drizzle'),
  ];

  return (
    <div className="space-y-10 text-base">
      <section className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{t('hero_title')}</h2>
        <p className="max-w-2xl text-muted-foreground">{t('hero_description')}</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t('mission_title')}</CardTitle>
          <CardDescription>{t('mission_description')}</CardDescription>
        </CardHeader>
      </Card>

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold text-foreground">{t('values_title')}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title} size="sm">
              <CardHeader>
                <value.icon aria-hidden className="size-5 text-primary" />
                <CardTitle>{value.title}</CardTitle>
                <CardDescription>{value.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold text-foreground">{t('tech_title')}</h3>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t('cta_title')}</CardTitle>
          <CardDescription>{t('cta_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/sign-up/">{t('cta_button')}</Link>
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <section className="space-y-2 text-center text-sm text-muted-foreground">
        <p>
          {`${t('translation_powered_by')} `}
          <a
            className="font-medium text-primary underline-offset-4 hover:underline"
            href="https://l.crowdin.com/next-js"
          >
            Crowdin
          </a>
        </p>
        <a href="https://l.crowdin.com/next-js">
          <Image className="mx-auto" src={crowdinLogo} alt={t('crowdin_logo_alt')} width={130} />
        </a>
      </section>
    </div>
  );
}
