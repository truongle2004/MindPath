import type { Card } from '@/modules/flashcard/entities/models/card';
import type {
  CreateCardInput,
  ReviewCardInput,
  UpdateCardInput,
} from '@/modules/flashcard/entities/models/card.schema';
import type { Deck } from '@/modules/flashcard/entities/models/deck';
import type { CreateDeckInput } from '@/modules/flashcard/entities/models/deck.schema';
import type { PomodoroSession } from '@/modules/flashcard/entities/models/pomodoro-session';
import type {
  CompletePomodoroSessionInput,
  CreatePomodoroSessionInput,
} from '@/modules/flashcard/entities/models/pomodoro-session.schema';

export type DeckDto = Deck;

export type CardDto = Card;

export type DeckWithCardsDto = {
  deck: DeckDto;
  cards: CardDto[];
};

export type GetDecksResponseDto = {
  decks: DeckDto[];
};

export type CreateDeckResponseDto = {
  deck: DeckDto;
};

export type CreateCardResponseDto = {
  card: CardDto;
};

export type UpdateCardResponseDto = {
  card: CardDto;
};

export type StudyCardsResponseDto = {
  cards: CardDto[];
};

export type ReviewCardResponseDto = {
  card: CardDto;
};

export type CreatePomodoroSessionResponseDto = {
  session: PomodoroSession;
};

export type CompletePomodoroSessionResponseDto = {
  session: PomodoroSession;
  focusMinutes: number;
};

export type DeleteResponseDto = null;

export type CreateDeckDto = CreateDeckInput;

export type CreateCardDto = CreateCardInput;

export type UpdateCardDto = UpdateCardInput;

export type ReviewCardDto = ReviewCardInput;

export type CreatePomodoroSessionDto = CreatePomodoroSessionInput;

export type CompletePomodoroSessionDto = CompletePomodoroSessionInput;
