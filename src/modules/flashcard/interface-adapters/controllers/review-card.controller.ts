import { InputParseError } from '@/core/entities/errors/input-parse-error';
import type { IReviewCardUseCase } from '@/modules/flashcard/application/use-cases/review-card.use-case';
import { reviewCardInputSchema } from '@/modules/flashcard/entities/models/card.schema';
import type {
  IReviewCardController,
  ReviewCardResponse,
} from '@/modules/flashcard/interface-adapters/controllers/review-card.controller.interface';
import type { IEnsureUserUseCase } from '@/modules/user/application/use-cases/ensure-user.use-case';
import { resolveUserId } from '@/modules/user/interface-adapters/resolve-user-id';

/**
 * Submits a review rating for a card for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param reviewCardUseCase The review-card use case.
 * @returns The review-card controller.
 */
export const reviewCardController =
  (
    ensureUserUseCase: IEnsureUserUseCase,
    reviewCardUseCase: IReviewCardUseCase,
  ): IReviewCardController =>
  async (auth, deckId, cardId, input): Promise<ReviewCardResponse> => {
    const parsed = reviewCardInputSchema.safeParse(input);

    if (!parsed.success) {
      throw new InputParseError('Invalid review input');
    }

    const userId = await resolveUserId(ensureUserUseCase, auth);
    const card = await reviewCardUseCase(deckId, cardId, userId, parsed.data);

    return { card };
  };
