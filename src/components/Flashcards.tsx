'use client';

import {
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
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type FlashcardItem = {
  id: string;
  question: string;
  answer: string;
};

type Status = 'unseen' | 'learning' | 'mastered';

/**
 * Returns a shuffled copy of the given array.
 * @param arr The items to shuffle.
 * @returns A new array with the same items in random order.
 */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = copy[i];
    const swap = copy[j];

    if (current === undefined || swap === undefined) {
      continue;
    }

    copy[i] = swap;
    copy[j] = current;
  }

  return copy;
}

/**
 * Builds an initial status map with every card marked unseen.
 * @param cards The flashcards in the session.
 * @returns A status record keyed by card id.
 */
function buildInitialStatuses(cards: FlashcardItem[]): Record<string, Status> {
  return Object.fromEntries(cards.map((card) => [card.id, 'unseen' as Status]));
}

/**
 * Interactive flashcard reviewer with flip, shuffle, and mastery tracking.
 * @param props The cards to review and optional layout classes.
 * @returns The flashcards UI.
 */
export function Flashcards(props: { cards: FlashcardItem[]; className?: string }) {
  const t = useTranslations('Flashcards');
  const [order, setOrder] = useState<FlashcardItem[]>(props.cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, Status>>(() =>
    buildInitialStatuses(props.cards),
  );

  const current = order[index];
  const masteredCount = Object.values(statuses).filter((status) => status === 'mastered').length;
  const progressPct = order.length === 0 ? 0 : ((index + 1) / order.length) * 100;

  function goTo(next: number) {
    if (next < 0 || next >= order.length) {
      return;
    }

    setIndex(next);
    setFlipped(false);
  }

  function mark(status: Status) {
    if (!current) {
      return;
    }

    setStatuses((prev) => ({ ...prev, [current.id]: status }));

    if (index < order.length - 1) {
      goTo(index + 1);
    }
  }

  function handleShuffle() {
    setOrder(shuffleArray(order));
    setIndex(0);
    setFlipped(false);
  }

  function handleReset() {
    setOrder(props.cards);
    setIndex(0);
    setFlipped(false);
    setStatuses(buildInitialStatuses(props.cards));
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.code === 'Space') {
        event.preventDefault();
        setFlipped((value) => !value);
      } else if (event.code === 'ArrowLeft') {
        goTo(index - 1);
      } else if (event.code === 'ArrowRight') {
        goTo(index + 1);
      }
    }

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyboard handlers need the latest index only
  }, [index, order.length]);

  if (!current) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col rounded-xl border bg-card text-card-foreground',
        props.className,
      )}
    >
      <div className="flex items-center justify-between px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-center gap-2 text-sm font-semibold sm:text-base">
          <BookOpen className="size-4 sm:size-5" />
          {t('title')}
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShuffle}
            title={t('shuffle_title')}
            aria-label={t('shuffle_title')}
          >
            <Shuffle />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            title={t('reset_title')}
            aria-label={t('reset_title')}
          >
            <RotateCcw />
          </Button>
        </div>
      </div>

      <p className="px-4 pt-1 text-xs text-muted-foreground sm:px-5 sm:text-sm">{t('hint')}</p>

      <div className="flex items-center justify-between px-4 pt-3 text-xs sm:px-5 sm:pt-4 sm:text-sm">
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium sm:text-xs">
          {t('progress', { current: index + 1, total: order.length })}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Sparkles className="size-3.5" />
          {t('mastered_count', { count: masteredCount })}
        </span>
      </div>
      <div className="px-4 pt-2 sm:px-5">
        <Progress value={progressPct} className="h-1.5" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-5 sm:px-5 sm:py-8">
        <button
          type="button"
          onClick={() => {
            setFlipped((value) => !value);
          }}
          className="flex min-h-[140px] w-full flex-1 flex-col items-center justify-center gap-2 rounded-lg border bg-background px-4 py-6 text-center transition-colors hover:bg-muted/50 sm:min-h-[200px] sm:px-6 sm:py-8 md:min-h-[240px]"
        >
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase sm:text-xs">
            {flipped ? t('answer_label') : t('question_label')}
          </span>
          <span className="text-lg leading-snug font-semibold sm:text-xl">
            {flipped ? current.answer : current.question}
          </span>
          {!flipped && (
            <span className="pt-2 text-[11px] text-muted-foreground sm:text-xs">
              {t('click_to_reveal')}
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between gap-1 px-2 pb-3 sm:px-5">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => {
            goTo(index - 1);
          }}
          disabled={index === 0}
          aria-label={t('previous_label')}
        >
          <ChevronLeft />
        </Button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <Button
            variant="outline"
            className="min-w-0 flex-1 truncate px-2 text-xs text-destructive hover:text-destructive sm:flex-none sm:px-4 sm:text-sm"
            onClick={() => {
              mark('learning');
            }}
          >
            <X data-icon="inline-start" />
            <span className="truncate">{t('still_learning')}</span>
          </Button>
          <Button
            className="min-w-0 flex-1 truncate px-2 text-xs sm:flex-none sm:px-4 sm:text-sm"
            onClick={() => {
              mark('mastered');
            }}
          >
            <Check data-icon="inline-start" />
            <span className="truncate">{t('mastered')}</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => {
            goTo(index + 1);
          }}
          disabled={index === order.length - 1}
          aria-label={t('next_label')}
        >
          <ChevronRight />
        </Button>
      </div>

      <p className="px-4 pb-4 text-center text-[11px] text-muted-foreground sm:pb-5 sm:text-xs">
        {t('keyboard_hint')}
      </p>
    </div>
  );
}
