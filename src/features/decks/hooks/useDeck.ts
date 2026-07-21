'use client';

import { useEffect, useState } from 'react';
import { getDeck } from '@/features/decks/services/decks.api';
import type { DeckStatus, UseDeckProps } from '@/features/decks/types/deck.types';
import type { CardDto, DeckDto } from '@/features/decks/types/decks-api.types';

type LoadDeckOptions = {
  deckId: string;
  isActive?: () => boolean;
  setDeck: (deck: DeckDto) => void;
  setCards: (cards: CardDto[]) => void;
  setStatus: (status: DeckStatus) => void;
};

async function loadDeck(options: LoadDeckOptions) {
  try {
    const body = await getDeck({ deckId: options.deckId });

    if (options.isActive?.() === false) {
      return;
    }

    options.setDeck(body.deck);
    options.setCards(body.cards);
    options.setStatus('ready');
  } catch {
    if (options.isActive?.() === false) {
      return;
    }

    options.setStatus('error');
  }
}

export function useDeck(props: UseDeckProps) {
  const [deck, setDeck] = useState<DeckDto | null>(null);
  const [cards, setCards] = useState<CardDto[]>([]);
  const [status, setStatus] = useState<DeckStatus>('loading');

  async function reloadDeck() {
    await loadDeck({
      deckId: props.deckId,
      setCards,
      setDeck,
      setStatus,
    });
  }

  useEffect(() => {
    let isActive = true;

    setStatus('loading');
    void loadDeck({
      deckId: props.deckId,
      isActive: () => isActive,
      setCards,
      setDeck,
      setStatus,
    });

    return () => {
      isActive = false;
    };
  }, [props.deckId]);

  return { deck, cards, status, reloadDeck };
}
