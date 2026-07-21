import type { StudyCardsStatus } from '@/features/decks/types/study-cards.types';

export const Rating = {
  Again: 1,
  Hard: 2,
  Good: 3,
  Easy: 4,
} as const;

export type RatingValue = (typeof Rating)[keyof typeof Rating];

export type UseStudySessionProps = {
  deckId: string;
};

type StudySessionPhase =
  | 'loading'
  | 'error'
  | 'empty'
  | 'question'
  | 'answer'
  | 'submitting'
  | 'done';

export type StudySessionResults = {
  again: number;
  hard: number;
  good: number;
  easy: number;
};

export type StudySessionState = {
  phase: StudySessionPhase;
  index: number;
  results: StudySessionResults;
  syncFailed: boolean;
};

export type StudySessionAction =
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
