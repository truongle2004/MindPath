'use client';

import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  Sparkles,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
    isCurrentCardReviewed,
    results,
    syncFailed,
    showAnswer,
    previousCard,
    nextCard,
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

      if (['question', 'answer'].includes(phase) && event.key === 'ArrowLeft') {
        event.preventDefault();
        previousCard();
      }

      if (['question', 'answer'].includes(phase) && event.key === 'ArrowRight') {
        event.preventDefault();
        nextCard();
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
  }, [nextCard, phase, previousCard, showAnswer, submitRating]);

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
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-muted-foreground" aria-hidden="true" />
            <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{t('instruction')}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label={t('shuffle_label')} onClick={shuffle}>
            <Shuffle className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t('restart_label')} onClick={restart}>
            <RotateCcw className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t('close_label')} asChild>
            <Link href={backHref}>
              <X className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="space-y-3 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1">
            {t('progress', { current: index + 1, total })}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <X className="size-4" aria-hidden="true" />
              {t('still_learning_count', { count: stillLearningCount })}
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="size-4" aria-hidden="true" />
              {t('mastered_count', { count: masteredCount })}
            </span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>

      {syncFailed ? <p className="text-sm text-destructive">{t('sync_failed_message')}</p> : null}

      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <Button variant="ghost" size="icon" aria-label={t('previous_label')} onClick={previousCard}>
          <ChevronLeft className="size-4" />
        </Button>
        <button
          type="button"
          className="flex min-h-64 flex-col items-center justify-center gap-6 rounded-lg px-4 py-10 text-center transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-disabled={phase !== 'question'}
          onClick={phase === 'question' ? showAnswer : undefined}
          tabIndex={phase === 'question' ? 0 : -1}
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {phase === 'question' ? t('question_label') : t('answer_label')}
            </p>
            <p className="text-xl font-medium whitespace-pre-wrap sm:text-2xl">
              {phase === 'question' ? card?.front : card?.back}
            </p>
          </div>
          {phase === 'question' ? (
            <p className="text-sm text-muted-foreground">{t('reveal_hint')}</p>
          ) : null}
        </button>
        <Button variant="ghost" size="icon" aria-label={t('next_label')} onClick={nextCard}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4">
        {phase === 'question' && <Button onClick={showAnswer}>{t('show_answer')}</Button>}

        {phase === 'answer' && !isCurrentCardReviewed && (
          <div className="flex w-full flex-col justify-center gap-2 sm:flex-row">
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                void submitRating(Rating.Again);
              }}
            >
              <X data-icon="inline-start" />
              {t('still_learning')}
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
              <Check data-icon="inline-start" />
              {t('mastered')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                void submitRating(Rating.Easy);
              }}
            >
              {t('rating_easy')}
            </Button>
          </div>
        )}

        {phase === 'answer' && isCurrentCardReviewed ? (
          <p className="text-sm text-muted-foreground">{t('already_reviewed')}</p>
        ) : null}

        {phase === 'submitting' && <Button disabled>{t('submitting')}</Button>}
        <p className="text-center text-sm text-muted-foreground">{t('keyboard_hint')}</p>
      </div>
    </section>
  );
}
