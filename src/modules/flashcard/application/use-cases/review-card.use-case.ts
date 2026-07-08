import { fsrs, State } from 'ts-fsrs';
import type { Grade } from 'ts-fsrs';
import { NotFoundError } from '@/core/entities/errors/not-found-error';
import type { ICardRepository } from '@/modules/flashcard/application/repositories/card.repository.interface';
import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';
import type { Card } from '@/modules/flashcard/entities/models/card';
import type { ReviewCardInput } from '@/modules/flashcard/entities/models/card.schema';

export type IReviewCardUseCase = (
  deckId: string,
  cardId: string,
  userId: string,
  input: ReviewCardInput,
) => Promise<Card>;

function stateFromString(state: string): State {
  switch (state) {
    case 'learning': {
      return State.Learning;
    }
    case 'review': {
      return State.Review;
    }
    case 'relearning': {
      return State.Relearning;
    }
    default: {
      return State.New;
    }
  }
}

function stateToString(state: State): string {
  switch (state) {
    case State.New: {
      return 'new';
    }
    case State.Learning: {
      return 'learning';
    }
    case State.Review: {
      return 'review';
    }
    case State.Relearning: {
      return 'relearning';
    }
    default: {
      return 'new';
    }
  }
}

/**
 * Applies a review rating to a card using FSRS and logs the review.
 * @param deckRepository The deck repository.
 * @param cardRepository The card repository.
 * @returns The review-card use case.
 */
export const reviewCardUseCase =
  (deckRepository: IDeckRepository, cardRepository: ICardRepository): IReviewCardUseCase =>
  async (deckId, cardId, userId, input) => {
    const deck = await deckRepository.findByIdForUser(deckId, userId);

    if (!deck) {
      throw new NotFoundError('Deck not found');
    }

    const card = await cardRepository.findByIdForDeck(cardId, deckId);

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    const f = fsrs();
    const now = new Date();

    const fsrsCard = {
      due: new Date(card.due),
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: card.elapsedDays,
      scheduled_days: card.scheduledDays,
      learning_steps: 0,
      reps: card.reps,
      lapses: card.lapses,
      state: stateFromString(card.state),
      last_review: card.lastReview ? new Date(card.lastReview) : undefined,
    };

    const scheduling = f.repeat(fsrsCard, now);
    const result = scheduling[input.rating as Grade];

    if (!result) {
      throw new NotFoundError('Card not found');
    }

    const newCard = result.card;
    const elapsedDays = card.lastReview
      ? Math.floor((now.getTime() - new Date(card.lastReview).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const updated = await cardRepository.applyFsrsReview(
      cardId,
      deckId,
      {
        stability: newCard.stability,
        difficulty: newCard.difficulty,
        due: newCard.due,
        elapsedDays,
        scheduledDays: newCard.scheduled_days,
        reps: newCard.reps,
        lapses: newCard.lapses,
        state: stateToString(newCard.state),
        lastReview: now,
      },
      {
        cardId,
        userId,
        rating: input.rating,
        stabilityBefore: card.stability,
        stabilityAfter: newCard.stability,
        difficultyAfter: newCard.difficulty,
        scheduledDays: newCard.scheduled_days,
      },
    );

    if (!updated) {
      throw new NotFoundError('Card not found');
    }

    return updated;
  };
