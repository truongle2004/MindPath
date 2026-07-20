'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useReducer, useRef } from 'react';
import { useStudyCards } from '@/features/decks/hooks/useStudyCards';
import { reviewCard } from '@/features/decks/services/decks.api';
import { Rating } from './study-session.types';
import type {
  RatingValue,
  StudySessionAction,
  StudySessionResults,
  StudySessionState,
} from './study-session.types';

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
  results: emptyResults,
  syncFailed: false,
};

const ratingKeyByValue: Record<RatingValue, keyof StudySessionResults> = {
  [Rating.Again]: 'again',
  [Rating.Hard]: 'hard',
  [Rating.Good]: 'good',
  [Rating.Easy]: 'easy',
};

function reducer(state: StudySessionState, action: StudySessionAction): StudySessionState {
  if (action.type === 'reset') {
    return initialState;
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

  if (action.type === 'submitStart') {
    return state.phase === 'answer' ? { ...state, phase: 'submitting' } : state;
  }

  if (action.type === 'submitDone') {
    const key = ratingKeyByValue[action.rating];
    const results = { ...state.results, [key]: state.results[key] + 1 };

    return {
      ...state,
      results,
      syncFailed: action.syncFailed,
      index: action.hasNext ? state.index + 1 : state.index,
      phase: action.hasNext ? 'question' : 'done',
    };
  }

  if (action.type === 'restart') {
    return { ...initialState, phase: 'question' };
  }

  return state;
}

export function useStudySession(props: { deckId: string }) {
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

  function showAnswer() {
    dispatch({ type: 'showAnswer' });
  }

  async function submitRating(rating: RatingValue) {
    const card = cards[state.index];

    if (!card || state.phase !== 'answer') {
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
      rating,
      syncFailed,
      hasNext: state.index + 1 < cards.length,
    });
  }

  function restart() {
    dispatch({ type: 'restart' });
  }

  return {
    phase: state.phase,
    card: cards[state.index],
    index: state.index,
    total: cards.length,
    results: state.results,
    syncFailed: state.syncFailed,
    showAnswer,
    submitRating,
    restart,
  };
}
