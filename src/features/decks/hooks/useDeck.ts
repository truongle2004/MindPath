'use client';

import { useEffect, useState } from 'react';
import { getDeck } from '@/features/decks/services/decks.api';
import type { CardDto, DeckDto } from '@/features/decks/services/decks.types';
import type { DeckStatus, UseDeckProps } from '@/features/decks/types/deck.types';

export function useDeck(props: UseDeckProps) {
  const [deck, setDeck] = useState<DeckDto | null>(null);
  const [cards, setCards] = useState<CardDto[]>([]);
  const [status, setStatus] = useState<DeckStatus>('loading');

  async function reloadDeck() {
    try {
      const body = await getDeck({ deckId: props.deckId });

      setDeck(body.deck);
      setCards(body.cards);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    setStatus('loading');
    void reloadDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when the route deck id changes.
  }, [props.deckId]);

  return { deck, cards, status, reloadDeck };
}
