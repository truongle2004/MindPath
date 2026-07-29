'use client';

import { ArrowLeft, BookOpen, Check, RotateCcw, Shuffle, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PomodoroTimer } from '@/features/decks/components/PomodoroTimer';
import { Rating, useStudySession } from '@/features/decks/hooks/useStudySession';
import type { RatingValue } from '@/features/decks/hooks/useStudySession';
import { Link } from '@/lib/I18nNavigation';

type StudyPageContentProps = {
  deckId: string;
};

export function StudyPageContent(props: Readonly<StudyPageContentProps>) {
  const t = useTranslations('StudyPage');
  const {
    phase,
    card,
    index,
    total,
    reviewedCount,
    results,
    syncFailed,
    showAnswer,
    shuffle,
    submitRating,
    restart,
  } = useStudySession({ deckId: props.deckId });
  const progressValue = total > 0 ? (reviewedCount / total) * 100 : 0;
  const masteredCount = results.good + results.easy;
  const stillLearningCount = results.again + results.hard;

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
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="sm" onClick={shuffle}>
            <Shuffle data-icon="inline-start" />
            {t('shuffle_label')}
          </Button>
          <Button variant="ghost" size="sm" onClick={restart}>
            <RotateCcw data-icon="inline-start" />
            {t('restart_label')}
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={backHref}>
              <ArrowLeft data-icon="inline-start" />
              {t('back_to_deck')}
            </Link>
          </Button>
        </div>
      </header>

      <PomodoroTimer deckId={props.deckId} />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="font-medium">{t('progress', { current: index + 1, total })}</span>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground" aria-hidden="true" />
              {t('still_learning_count', { count: stillLearningCount })}
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-4" aria-hidden="true" />
              {t('mastered_count', { count: masteredCount })}
            </span>
          </div>
        </div>
        <progress
          className="h-1.5 w-full accent-primary"
          aria-label={t('progress', { current: reviewedCount, total })}
          max={total}
          value={reviewedCount}
        >
          {progressValue}%
        </progress>
      </div>

      {syncFailed ? <p className="text-sm text-destructive">{t('sync_failed_message')}</p> : null}

      {phase === 'question' ? (
        <button
          type="button"
          className="flex min-h-80 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-10 text-center shadow-sm transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={showAnswer}
        >
          <span className="text-sm font-medium text-muted-foreground">{t('question_label')}</span>
          <span className="mt-4 text-2xl font-medium whitespace-pre-wrap sm:text-3xl">
            {card?.front}
          </span>
          <span className="mt-10 text-sm text-muted-foreground">{t('reveal_hint')}</span>
        </button>
      ) : (
        <article className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-10 text-center shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">{t('answer_label')}</p>
          <p className="mt-4 text-2xl font-medium whitespace-pre-wrap sm:text-3xl">{card?.back}</p>
        </article>
      )}

      <div className="border-t border-border pt-5">
        {phase === 'question' ? (
          <p className="text-center text-sm text-muted-foreground">{t('keyboard_reveal_hint')}</p>
        ) : null}

        {phase === 'answer' ? (
          <div className="space-y-3">
            <p className="text-center text-sm font-medium">{t('rating_prompt')}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Button
                variant="outline"
                className="justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  void submitRating(Rating.Again);
                }}
              >
                <span className="text-muted-foreground" aria-hidden="true">
                  1
                </span>
                {t('rating_again')}
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => {
                  void submitRating(Rating.Hard);
                }}
              >
                <span className="text-muted-foreground" aria-hidden="true">
                  2
                </span>
                {t('rating_hard')}
              </Button>
              <Button
                className="justify-start"
                onClick={() => {
                  void submitRating(Rating.Good);
                }}
              >
                <span className="text-primary-foreground/80" aria-hidden="true">
                  3
                </span>
                {t('rating_good')}
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => {
                  void submitRating(Rating.Easy);
                }}
              >
                <span className="text-muted-foreground" aria-hidden="true">
                  4
                </span>
                {t('rating_easy')}
              </Button>
            </div>
          </div>
        ) : null}

        {phase === 'submitting' ? (
          <output className="block text-center text-sm text-muted-foreground">
            {t('submitting')}
          </output>
        ) : null}
      </div>
    </section>
  );
}
