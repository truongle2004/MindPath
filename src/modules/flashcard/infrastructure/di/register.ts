import type { DependencyContainer } from 'tsyringe';
import { Tokens as DbTokens } from '@/infrastructure/di/tokens';
import { createCardUseCase } from '@/modules/flashcard/application/use-cases/create-card.use-case';
import { createDeckUseCase } from '@/modules/flashcard/application/use-cases/create-deck.use-case';
import { deleteCardUseCase } from '@/modules/flashcard/application/use-cases/delete-card.use-case';
import { deleteDeckUseCase } from '@/modules/flashcard/application/use-cases/delete-deck.use-case';
import { getDeckWithCardsUseCase } from '@/modules/flashcard/application/use-cases/get-deck-with-cards.use-case';
import { getDecksUseCase } from '@/modules/flashcard/application/use-cases/get-decks.use-case';
import { updateCardUseCase } from '@/modules/flashcard/application/use-cases/update-card.use-case';
import { updateDeckUseCase } from '@/modules/flashcard/application/use-cases/update-deck.use-case';
import { Tokens } from '@/modules/flashcard/infrastructure/di/tokens';
import { createDrizzleCardRepository } from '@/modules/flashcard/infrastructure/repositories/drizzle-card.repository';
import { createDrizzleDeckRepository } from '@/modules/flashcard/infrastructure/repositories/drizzle-deck.repository';
import {
  createCardController,
  deleteCardController,
  updateCardController,
} from '@/modules/flashcard/interface-adapters/controllers/card.controller';
import { createDeckController } from '@/modules/flashcard/interface-adapters/controllers/create-deck.controller';
import { getDeckController } from '@/modules/flashcard/interface-adapters/controllers/get-deck.controller';
import { getDecksController } from '@/modules/flashcard/interface-adapters/controllers/get-decks.controller';
import {
  deleteDeckController,
  updateDeckController,
} from '@/modules/flashcard/interface-adapters/controllers/update-deck.controller';
import { Tokens as UserTokens } from '@/modules/user/infrastructure/di/tokens';

/**
 * Registers flashcard module dependencies on the root container.
 * @param container The container to register dependencies on.
 */
export function registerFlashcardModule(container: DependencyContainer) {
  container.register(Tokens.DeckRepository, {
    useFactory: (dependencyContainer) =>
      createDrizzleDeckRepository(dependencyContainer.resolve(DbTokens.DbClient)),
  });

  container.register(Tokens.CardRepository, {
    useFactory: (dependencyContainer) =>
      createDrizzleCardRepository(dependencyContainer.resolve(DbTokens.DbClient)),
  });

  container.register(Tokens.GetDecksUseCase, {
    useFactory: (dependencyContainer) =>
      getDecksUseCase(dependencyContainer.resolve(Tokens.DeckRepository)),
  });

  container.register(Tokens.CreateDeckUseCase, {
    useFactory: (dependencyContainer) =>
      createDeckUseCase(dependencyContainer.resolve(Tokens.DeckRepository)),
  });

  container.register(Tokens.UpdateDeckUseCase, {
    useFactory: (dependencyContainer) =>
      updateDeckUseCase(dependencyContainer.resolve(Tokens.DeckRepository)),
  });

  container.register(Tokens.DeleteDeckUseCase, {
    useFactory: (dependencyContainer) =>
      deleteDeckUseCase(dependencyContainer.resolve(Tokens.DeckRepository)),
  });

  container.register(Tokens.GetDeckWithCardsUseCase, {
    useFactory: (dependencyContainer) =>
      getDeckWithCardsUseCase(
        dependencyContainer.resolve(Tokens.DeckRepository),
        dependencyContainer.resolve(Tokens.CardRepository),
      ),
  });

  container.register(Tokens.CreateCardUseCase, {
    useFactory: (dependencyContainer) =>
      createCardUseCase(
        dependencyContainer.resolve(Tokens.DeckRepository),
        dependencyContainer.resolve(Tokens.CardRepository),
      ),
  });

  container.register(Tokens.UpdateCardUseCase, {
    useFactory: (dependencyContainer) =>
      updateCardUseCase(
        dependencyContainer.resolve(Tokens.DeckRepository),
        dependencyContainer.resolve(Tokens.CardRepository),
      ),
  });

  container.register(Tokens.DeleteCardUseCase, {
    useFactory: (dependencyContainer) =>
      deleteCardUseCase(
        dependencyContainer.resolve(Tokens.DeckRepository),
        dependencyContainer.resolve(Tokens.CardRepository),
      ),
  });

  container.register(Tokens.GetDecksController, {
    useFactory: (dependencyContainer) =>
      getDecksController(
        dependencyContainer.resolve(UserTokens.EnsureUserUseCase),
        dependencyContainer.resolve(Tokens.GetDecksUseCase),
      ),
  });

  container.register(Tokens.CreateDeckController, {
    useFactory: (dependencyContainer) =>
      createDeckController(
        dependencyContainer.resolve(UserTokens.EnsureUserUseCase),
        dependencyContainer.resolve(Tokens.CreateDeckUseCase),
      ),
  });

  container.register(Tokens.GetDeckController, {
    useFactory: (dependencyContainer) =>
      getDeckController(
        dependencyContainer.resolve(UserTokens.EnsureUserUseCase),
        dependencyContainer.resolve(Tokens.GetDeckWithCardsUseCase),
      ),
  });

  container.register(Tokens.UpdateDeckController, {
    useFactory: (dependencyContainer) =>
      updateDeckController(
        dependencyContainer.resolve(UserTokens.EnsureUserUseCase),
        dependencyContainer.resolve(Tokens.UpdateDeckUseCase),
      ),
  });

  container.register(Tokens.DeleteDeckController, {
    useFactory: (dependencyContainer) =>
      deleteDeckController(
        dependencyContainer.resolve(UserTokens.EnsureUserUseCase),
        dependencyContainer.resolve(Tokens.DeleteDeckUseCase),
      ),
  });

  container.register(Tokens.CreateCardController, {
    useFactory: (dependencyContainer) =>
      createCardController(
        dependencyContainer.resolve(UserTokens.EnsureUserUseCase),
        dependencyContainer.resolve(Tokens.CreateCardUseCase),
      ),
  });

  container.register(Tokens.UpdateCardController, {
    useFactory: (dependencyContainer) =>
      updateCardController(
        dependencyContainer.resolve(UserTokens.EnsureUserUseCase),
        dependencyContainer.resolve(Tokens.UpdateCardUseCase),
      ),
  });

  container.register(Tokens.DeleteCardController, {
    useFactory: (dependencyContainer) =>
      deleteCardController(
        dependencyContainer.resolve(UserTokens.EnsureUserUseCase),
        dependencyContainer.resolve(Tokens.DeleteCardUseCase),
      ),
  });
}
