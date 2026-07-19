'use client';

import { useEffect, useState } from 'react';
import { getStudyCards } from '@/features/decks/services/decks.api';
import type { CardDto } from '@/features/decks/services/decks.types';

type StudyCardsStatus = 'loading' | 'error' | 'empty' | 'ready';

export function useStudyCards(props: { deckId: string }) {
  const [cards, setCards] = useState<CardDto[]>([]);
  const [status, setStatus] = useState<StudyCardsStatus>('loading');

  useEffect(() => {
    async function loadStudyCards() {
      try {
        setStatus('loading');
        const body = await getStudyCards({ deckId: props.deckId });

        setCards(body.cards);
        setStatus(body.cards.length === 0 ? 'empty' : 'ready');
      } catch {
        setStatus('error');
      }
    }

    void loadStudyCards();
  }, [props.deckId]);

  return { cards, status };
}
