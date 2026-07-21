'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useReducer, useRef } from 'react';
import { useStudyCards } from '@/features/decks/hooks/useStudyCards';
import { reviewCard } from '@/features/decks/services/decks.api';
import { Rating } from '@/features/decks/types/study-session.types';
import type {
  RatingValue,
  StudySessionAction,
  StudySessionResults,
  StudySessionState,
  UseStudySessionProps,
} from '@/features/decks/types/study-session.types';

export { Rating };
export type { RatingValue };

const emptyResults: StudySessionResults = {
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
};

const initialState: StudySessionState = {
  phase: 'loading',
  index: 0,
  order: [],
  reviewedCardIds: [],
  results: emptyResults,
  syncFailed: false,
};

const ratingKeyByValue: Record<RatingValue, keyof StudySessionResults> = {
  [Rating.Again]: 'again',
  [Rating.Hard]: 'hard',
  [Rating.Good]: 'good',
  [Rating.Easy]: 'easy',
};

function shuffleCardIds(cardIds: string[]) {
  const shuffledCardIds = [...cardIds];

  for (let index = shuffledCardIds.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentCardId = shuffledCardIds[index];
    const randomCardId = shuffledCardIds[randomIndex];

    if (currentCardId && randomCardId) {
      shuffledCardIds[index] = randomCardId;
      shuffledCardIds[randomIndex] = currentCardId;
    }
  }

  return shuffledCardIds;
}

function getNextUnreviewedIndex(props: {
  order: string[];
  reviewedCardIds: string[];
  currentIndex: number;
}) {
  for (let offset = 1; offset <= props.order.length; offset += 1) {
    const index = (props.currentIndex + offset) % props.order.length;
    const cardId = props.order[index];

    if (cardId && !props.reviewedCardIds.includes(cardId)) {
      return index;
    }
  }

  return -1;
}

function moveCard(state: StudySessionState, direction: 'previousCard' | 'nextCard') {
  if (!['question', 'answer'].includes(state.phase) || state.order.length === 0) {
    return state;
  }

  if (direction === 'nextCard') {
    return {
      ...state,
      index: (state.index + 1) % state.order.length,
      phase: 'question' as const,
    };
  }

  const index = state.index === 0 ? state.order.length - 1 : state.index - 1;

  return { ...state, index, phase: 'question' as const };
}

function completeSubmit(
  state: StudySessionState,
  action: Extract<StudySessionAction, { type: 'submitDone' }>,
) {
  const key = ratingKeyByValue[action.rating];
  const reviewedCardIds = state.reviewedCardIds.includes(action.cardId)
    ? state.reviewedCardIds
    : [...state.reviewedCardIds, action.cardId];
  const results = { ...state.results, [key]: state.results[key] + 1 };
  const nextIndex = getNextUnreviewedIndex({
    order: state.order,
    reviewedCardIds,
    currentIndex: state.index,
  });

  return {
    ...state,
    reviewedCardIds,
    results,
    syncFailed: action.syncFailed,
    index: nextIndex === -1 ? state.index : nextIndex,
    phase: nextIndex === -1 ? ('done' as const) : ('question' as const),
  };
}

function reducer(state: StudySessionState, action: StudySessionAction): StudySessionState {
  if (action.type === 'reset') {
    return initialState;
  }

  if (action.type === 'initialize') {
    return {
      ...initialState,
      phase: action.cardIds.length > 0 ? 'question' : 'empty',
      order: action.cardIds,
    };
  }

  if (action.type === 'setStatus') {
    return {
      ...state,
      phase: action.status === 'ready' ? 'question' : action.status,
    };
  }

  if (action.type === 'showAnswer') {
    return state.phase === 'question' ? { ...state, phase: 'answer' } : state;
  }

  if (action.type === 'previousCard' || action.type === 'nextCard') {
    return moveCard(state, action.type);
  }

  if (action.type === 'shuffle') {
    return {
      ...initialState,
      phase: state.order.length > 0 ? 'question' : state.phase,
      order: shuffleCardIds(state.order),
    };
  }

  if (action.type === 'submitStart') {
    return state.phase === 'answer' ? { ...state, phase: 'submitting' } : state;
  }

  if (action.type === 'submitDone') {
    return completeSubmit(state, action);
  }

  if (action.type === 'restart') {
    return { ...initialState, phase: 'question', order: state.order };
  }

  return state;
}

export function useStudySession(props: UseStudySessionProps) {
  const { cards, status } = useStudyCards({ deckId: props.deckId });
  const reviewCardMutation = useMutation({ mutationFn: reviewCard });
  const [state, dispatch] = useReducer(reducer, initialState);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    dispatch({ type: 'reset' });
  }, [props.deckId]);

  useEffect(() => {
    dispatch({ type: 'setStatus', status });
  }, [status]);

  useEffect(() => {
    if (status === 'ready') {
      dispatch({ type: 'initialize', cardIds: cards.map((card) => card.id) });
    }
  }, [cards, status]);

  const currentCardId = state.order[state.index];
  const currentCard = cards.find((card) => card.id === currentCardId);
  const isCurrentCardReviewed = currentCardId
    ? state.reviewedCardIds.includes(currentCardId)
    : false;

  function showAnswer() {
    dispatch({ type: 'showAnswer' });
  }

  async function submitRating(rating: RatingValue) {
    const card = currentCard;

    if (!card || state.phase !== 'answer' || state.reviewedCardIds.includes(card.id)) {
      return;
    }

    dispatch({ type: 'submitStart' });

    let syncFailed = false;
    try {
      await reviewCardMutation.mutateAsync({
        deckId: props.deckId,
        cardId: card.id,
        input: { rating },
      });
    } catch {
      syncFailed = true;
    }

    if (!isMountedRef.current) {
      return;
    }

    dispatch({
      type: 'submitDone',
      cardId: card.id,
      rating,
      syncFailed,
    });
  }

  function previousCard() {
    dispatch({ type: 'previousCard' });
  }

  function nextCard() {
    dispatch({ type: 'nextCard' });
  }

  function shuffle() {
    dispatch({ type: 'shuffle' });
  }

  function restart() {
    dispatch({ type: 'restart' });
  }

  return {
    phase: state.phase,
    card: currentCard,
    index: state.index,
    total: state.order.length,
    reviewedCount: state.reviewedCardIds.length,
    isCurrentCardReviewed,
    results: state.results,
    syncFailed: state.syncFailed,
    showAnswer,
    previousCard,
    nextCard,
    shuffle,
    submitRating,
    restart,
  };
}
