'use client';

import { useQuery } from '@tanstack/react-query';
import { getStudyCards } from '@/features/decks/services/decks.api';
import type { StudyCardsStatus } from './study-session.types';

function getStudyCardsStatus(props: {
  isLoading: boolean;
  isError: boolean;
  cardCount: number;
}): StudyCardsStatus {
  if (props.isLoading) {
    return 'loading';
  }

  if (props.isError) {
    return 'error';
  }

  if (props.cardCount === 0) {
    return 'empty';
  }

  return 'ready';
}

export function useStudyCards(props: { deckId: string }) {
  const query = useQuery({
    queryKey: ['study-cards', props.deckId],
    queryFn: async () => await getStudyCards({ deckId: props.deckId }),
    refetchOnWindowFocus: false,
  });

  const cards = query.data?.cards ?? [];
  const status = getStudyCardsStatus({
    isLoading: query.isLoading,
    isError: query.isError,
    cardCount: cards.length,
  });

  return { cards, status };
}
