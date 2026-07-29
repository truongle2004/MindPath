'use client';

import { useTranslations } from 'next-intl';
import { PomodoroTimer } from '@/features/decks/components/PomodoroTimer';

export function PomodoroPageContent() {
  const t = useTranslations('PomodoroPage');

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('page_title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('page_description')}</p>
      </div>
      <PomodoroTimer />
    </section>
  );
}
