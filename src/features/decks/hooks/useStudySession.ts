'use client';

import { useEffect, useReducer, useRef } from 'react';
import { useStudyCards } from '@/features/decks/hooks/useStudyCards';
import { reviewCard } from '@/features/decks/services/decks.api';

export const Rating = {
  Again: 1,
  Hard: 2,
  Good: 3,
  Easy: 4,
} as const;

export type RatingValue = (typeof Rating)[keyof typeof Rating];

type Phase = 'loading' | 'error' | 'empty' | 'question' | 'answer' | 'submitting' | 'done';

type Results = { again: number; hard: number; good: number; easy: number };

type StudyCardsStatus = 'loading' | 'error' | 'empty' | 'ready';

type State = {
  phase: Phase;
  index: number;
  results: Results;
  syncFailed: boolean;
};

type Action =
  | { type: 'reset' }
  | { type: 'setStatus'; status: StudyCardsStatus }
  | { type: 'showAnswer' }
  | { type: 'submitStart' }
  | {
      type: 'submitDone';
      rating: RatingValue;
      syncFailed: boolean;
      hasNext: boolean;
    }
  | { type: 'restart' };

const emptyResults: Results = { again: 0, hard: 0, good: 0, easy: 0 };

const initialState: State = {
  phase: 'loading',
  index: 0,
  results: emptyResults,
  syncFailed: false,
};

const ratingKeyByValue: Record<RatingValue, keyof Results> = {
  [Rating.Again]: 'again',
  [Rating.Hard]: 'hard',
  [Rating.Good]: 'good',
  [Rating.Easy]: 'easy',
};

function reducer(state: State, action: Action): State {
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

/**
 * Encapsulates state transitions and review submission for a study session.
 * @param props The deck id whose due cards are being studied.
 * @returns Study session state and event handlers.
 */
export function useStudySession(props: { deckId: string }) {
  const { cards, status } = useStudyCards({ deckId: props.deckId });
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
      await reviewCard({
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
