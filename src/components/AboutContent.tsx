'use client';

import { Brain, Layers, Repeat, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const methodKeys = [
  { key: 'spaced_repetition', icon: Repeat },
  { key: 'active_recall', icon: Brain },
  { key: 'interleaving', icon: Layers },
  { key: 'deliberate_practice', icon: Target },
] as const;

/**
 * About page content describing learning methods backed by cognitive science.
 * @returns The about page main content.
 */
export function AboutContent() {
  const t = useTranslations('AboutPage');

  const methods = methodKeys.map(({ key, icon }) => ({
    icon,
    title: t(`method_${key}_title`),
    description: t(`method_${key}_description`),
  }));

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <section className="space-y-4 text-center">
        <Badge variant="secondary">{t('badge')}</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">{t('hero_title')}</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t('hero_description')}</p>
      </section>

      <Separator className="my-12" />

      <section>
        <h2 className="mb-6 text-center text-2xl font-semibold">{t('methods_title')}</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {methods.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      <section className="grid items-start gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-2xl font-semibold">{t('why_title')}</h2>
          <p className="leading-relaxed text-muted-foreground">{t('why_description')}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('research_title')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold">{t('stat_retention_value')}</p>
              <p className="text-xs text-muted-foreground">{t('stat_retention_label')}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{t('stat_time_value')}</p>
              <p className="text-xs text-muted-foreground">{t('stat_time_label')}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{t('stat_studies_value')}</p>
              <p className="text-xs text-muted-foreground">{t('stat_studies_label')}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <section className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold">{t('cta_title')}</h2>
        <p className="text-muted-foreground">{t('cta_description')}</p>
        <Button size="lg">{t('cta_button')}</Button>
      </section>
    </main>
  );
}
