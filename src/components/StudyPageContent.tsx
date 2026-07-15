'use client';

import { ArrowLeft, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/libs/I18nNavigation';
import type { Card } from '@/modules/flashcard/entities/models/card';

type StudyPageContentProps = {
  deckId: string;
};

type Phase = 'loading' | 'error' | 'empty' | 'question' | 'answer' | 'submitting' | 'done';

type Results = { again: number; hard: number; good: number; easy: number };

/**
 * Checks whether a value matches the study response shape.
 * @param value The parsed JSON body.
 * @returns True when the body contains a cards array.
 */
function isStudyResponse(value: unknown): value is { cards: Card[] } {
  if (typeof value !== 'object' || value === null || !('cards' in value)) {
    return false;
  }
  return Array.isArray(value.cards);
}

/**
 * Full-page study session component that presents due cards one by one for review.
 * @param props The deck id from the route.
 * @returns The study session UI.
 */
export function StudyPageContent(props: StudyPageContentProps) {
  const t = useTranslations('StudyPage');
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const [results, setResults] = useState<Results>({ again: 0, hard: 0, good: 0, easy: 0 });

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/decks/${props.deckId}/study`);

        if (!response.ok) {
          setPhase('error');
          return;
        }

        const body: unknown = await response.json();

        if (!isStudyResponse(body)) {
          setPhase('error');
          return;
        }

        if (body.cards.length === 0) {
          setPhase('empty');
          return;
        }

        setCards(body.cards);
        setPhase('question');
      } catch {
        setPhase('error');
      }
    }

    void load();
  }, [props.deckId]);

  async function submitRating(rating: 1 | 2 | 3 | 4) {
    const card = cards[index];

    if (!card) {
      return;
    }

    setPhase('submitting');

    try {
      await fetch(`/api/decks/${props.deckId}/cards/${card.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
    } catch {
      // continue session even if network fails
    }

    let key: keyof Results;
    if (rating === 1) {
      key = 'again';
    } else if (rating === 2) {
      key = 'hard';
    } else if (rating === 3) {
      key = 'good';
    } else {
      key = 'easy';
    }
    setResults((prev) => ({ ...prev, [key]: prev[key] + 1 }));

    const nextIndex = index + 1;

    if (nextIndex >= cards.length) {
      setPhase('done');
    } else {
      setIndex(nextIndex);
      setPhase('question');
    }
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (phase === 'question' && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault();
        setPhase('answer');
      }

      if (phase === 'answer') {
        if (event.key === '1') {
          void submitRating(1);
        }
        if (event.key === '2') {
          void submitRating(2);
        }
        if (event.key === '3') {
          void submitRating(3);
        }
        if (event.key === '4') {
          void submitRating(4);
        }
      }
    }

    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, cards]);

  const card = cards[index];
  const total = cards.length;
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
          <Button
            onClick={() => {
              setIndex(0);
              setResults({ again: 0, hard: 0, good: 0, easy: 0 });
              setPhase('question');
            }}
          >
            {t('study_again')}
          </Button>
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
        {phase === 'question' && (
          <Button
            onClick={() => {
              setPhase('answer');
            }}
          >
            {t('show_answer')}
          </Button>
        )}

        {phase === 'answer' && (
          <>
            <Button
              variant="destructive"
              onClick={() => {
                void submitRating(1);
              }}
            >
              {t('rating_again')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                void submitRating(2);
              }}
            >
              {t('rating_hard')}
            </Button>
            <Button
              onClick={() => {
                void submitRating(3);
              }}
            >
              {t('rating_good')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void submitRating(4);
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
