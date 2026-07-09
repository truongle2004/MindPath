import { InputParseError } from '@/entities/errors/input-parse-error';
import type { ICreateDeckUseCase } from '@/modules/flashcard/application/use-cases/create-deck.use-case';
import type { Deck } from '@/modules/flashcard/entities/models/deck';
import { createDeckInputSchema } from '@/modules/flashcard/entities/models/deck.schema';
import type { IEnsureUserUseCase } from '@/modules/user/application/use-cases/ensure-user.use-case';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';
import { resolveUserId } from '@/modules/user/interface-adapters/resolve-user-id';

export type CreateDeckResponse = {
  deck: Deck;
};

export type ICreateDeckController = (
  auth: AuthContext | null,
  input: unknown,
) => Promise<CreateDeckResponse>;

/**
 * Creates a deck for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param createDeckUseCase The create-deck use case.
 * @returns The create-deck controller.
 */
export const createDeckController =
  (
    ensureUserUseCase: IEnsureUserUseCase,
    createDeckUseCase: ICreateDeckUseCase,
  ): ICreateDeckController =>
  async (auth: AuthContext | null, input: unknown): Promise<CreateDeckResponse> => {
    const parsed = createDeckInputSchema.safeParse(input);

    if (!parsed.success) {
      throw new InputParseError('Invalid deck input');
    }

    const userId = await resolveUserId(ensureUserUseCase, auth);
    const deck = await createDeckUseCase(userId, parsed.data);

    return { deck };
  };
