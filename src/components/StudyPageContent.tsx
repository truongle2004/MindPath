'use client';

import { ArrowLeft, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Rating, useStudySession } from '@/features/decks/hooks/useStudySession';
import type { RatingValue } from '@/features/decks/hooks/useStudySession';
import { Link } from '@/libs/I18nNavigation';

type StudyPageContentProps = {
  deckId: string;
};

/**
 * Full-page study session component that presents due cards one by one for review.
 * @param props The deck id from the route.
 * @returns The study session UI.
 */
export function StudyPageContent(props: StudyPageContentProps) {
  const t = useTranslations('StudyPage');
  const { phase, card, index, total, results, syncFailed, showAnswer, submitRating, restart } =
    useStudySession({ deckId: props.deckId });

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (phase === 'question' && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault();
        showAnswer();
      }

      if (phase === 'answer') {
        const ratingByKey: Record<string, RatingValue> = {
          '1': Rating.Again,
          '2': Rating.Hard,
          '3': Rating.Good,
          '4': Rating.Easy,
        };
        const rating = ratingByKey[event.key];

        if (rating) {
          void submitRating(rating);
        }
      }
    }

    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [phase, showAnswer, submitRating]);

  const backHref = `/dashboard/decks/${props.deckId}`;

  if (phase === 'loading') {
    return <p className="text-muted-foreground">{t('loading_message')}</p>;
  }

  if (phase === 'error') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t('error_message')}</p>
        <Button variant="outline" asChild className="w-fit">
          <Link href={backHref}>
            <ArrowLeft data-icon="inline-start" />
            {t('back_to_deck')}
          </Link>
        </Button>
      </div>
    );
  }

  if (phase === 'empty') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Check className="size-10 text-muted-foreground" />
        <div>
          <h2 className="text-xl font-semibold">{t('no_cards_title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('no_cards_description')}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={backHref}>
            <ArrowLeft data-icon="inline-start" />
            {t('back_to_deck')}
          </Link>
        </Button>
      </div>
    );
  }

  if (phase === 'done') {
    const reviewed = results.again + results.hard + results.good + results.easy;

    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div>
          <h2 className="text-2xl font-semibold">{t('done_title')}</h2>
          <p className="mt-1 text-muted-foreground">{t('done_description', { count: reviewed })}</p>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>{t('done_again', { count: results.again })}</span>
          <span>{t('done_hard', { count: results.hard })}</span>
          <span>{t('done_good', { count: results.good })}</span>
          <span>{t('done_easy', { count: results.easy })}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={backHref}>
              <ArrowLeft data-icon="inline-start" />
              {t('back_to_deck')}
            </Link>
          </Button>
          <Button onClick={restart}>{t('study_again')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="w-fit" asChild>
          <Link href={backHref}>
            <ArrowLeft data-icon="inline-start" />
            {t('back_to_deck')}
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          {t('progress', { current: index + 1, total })}
        </span>
      </div>

      {syncFailed ? <p className="text-sm text-destructive">{t('sync_failed_message')}</p> : null}

      <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-lg font-semibold whitespace-pre-wrap">{card?.front}</p>
        </div>

        {(phase === 'answer' || phase === 'submitting') && (
          <>
            <div className="h-px w-full bg-border" />
            <div className="flex min-h-32 flex-col items-center justify-center p-8 text-center">
              <p className="text-base whitespace-pre-wrap text-muted-foreground">{card?.back}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-center gap-2">
        {phase === 'question' && <Button onClick={showAnswer}>{t('show_answer')}</Button>}

        {phase === 'answer' && (
          <>
            <Button
              variant="destructive"
              onClick={() => {
                void submitRating(Rating.Again);
              }}
            >
              {t('rating_again')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                void submitRating(Rating.Hard);
              }}
            >
              {t('rating_hard')}
            </Button>
            <Button
              onClick={() => {
                void submitRating(Rating.Good);
              }}
            >
              {t('rating_good')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void submitRating(Rating.Easy);
              }}
            >
              {t('rating_easy')}
            </Button>
          </>
        )}

        {phase === 'submitting' && <Button disabled>{t('submitting')}</Button>}
      </div>
    </div>
  );
}
