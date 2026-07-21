'use client';

import { useEffect, useState } from 'react';
import { getDecks } from '@/features/decks/services/decks.api';
import type { DeckDto } from '@/features/decks/types/decks-api.types';
import type { DecksStatus } from '@/features/decks/types/decks.types';

export function useDecks() {
  const [decks, setDecks] = useState<DeckDto[]>([]);
  const [status, setStatus] = useState<DecksStatus>('loading');

  async function reloadDecks() {
    try {
      const body = await getDecks();

      setDecks(body.decks);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    void reloadDecks();
  }, []);

  return { decks, status, reloadDecks };
}
