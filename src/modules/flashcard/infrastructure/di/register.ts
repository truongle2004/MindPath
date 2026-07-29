import type { DependencyContainer } from 'tsyringe';
import { Tokens as DbTokens } from '@/infrastructure/di/tokens';
import { completePomodoroSessionUseCase } from '@/modules/flashcard/application/use-cases/complete-pomodoro-session.use-case';
import { createCardUseCase } from '@/modules/flashcard/application/use-cases/create-card.use-case';
import { createDeckUseCase } from '@/modules/flashcard/application/use-cases/create-deck.use-case';
import { createPomodoroSessionUseCase } from '@/modules/flashcard/application/use-cases/create-pomodoro-session.use-case';
import { deleteCardUseCase } from '@/modules/flashcard/application/use-cases/delete-card.use-case';
import { deleteDeckUseCase } from '@/modules/flashcard/application/use-cases/delete-deck.use-case';
import { getDeckWithCardsUseCase } from '@/modules/flashcard/application/use-cases/get-deck-with-cards.use-case';
import { getDecksUseCase } from '@/modules/flashcard/application/use-cases/get-decks.use-case';
import { getDueCardsUseCase } from '@/modules/flashcard/application/use-cases/get-due-cards.use-case';
import { reviewCardUseCase } from '@/modules/flashcard/application/use-cases/review-card.use-case';
import { updateCardUseCase } from '@/modules/flashcard/application/use-cases/update-card.use-case';
import { updateDeckUseCase } from '@/modules/flashcard/application/use-cases/update-deck.use-case';
import { Tokens } from '@/modules/flashcard/infrastructure/di/tokens';
import { createDrizzleCardRepository } from '@/modules/flashcard/infrastructure/repositories/drizzle-card.repository';
import { createDrizzleDeckRepository } from '@/modules/flashcard/infrastructure/repositories/drizzle-deck.repository';
import { createDrizzlePomodoroSessionRepository } from '@/modules/flashcard/infrastructure/repositories/drizzle-pomodoro-session.repository';
import {
  createCardController,
  deleteCardController,
  updateCardController,
} from '@/modules/flashcard/interface-adapters/controllers/card.controller';
import { createDeckController } from '@/modules/flashcard/interface-adapters/controllers/create-deck.controller';
import { getDeckController } from '@/modules/flashcard/interface-adapters/controllers/get-deck.controller';
import { getDecksController } from '@/modules/flashcard/interface-adapters/controllers/get-decks.controller';
import { getDueCardsController } from '@/modules/flashcard/interface-adapters/controllers/get-due-cards.controller';
import {
  completePomodoroSessionController,
  createPomodoroSessionController,
} from '@/modules/flashcard/interface-adapters/controllers/pomodoro-session.controller';
import { reviewCardController } from '@/modules/flashcard/interface-adapters/controllers/review-card.controller';
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

  container.register(Tokens.PomodoroSessionRepository, {
    useFactory: (dependencyContainer) =>
      createDrizzlePomodoroSessionRepository(dependencyContainer.resolve(DbTokens.DbClient)),
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

  container.register(Tokens.CreatePomodoroSessionUseCase, {
    useFactory: (dependencyContainer) =>
      createPomodoroSessionUseCase(
        dependencyContainer.resolve(Tokens.DeckRepository),
        dependencyContainer.resolve(Tokens.PomodoroSessionRepository),
      ),
  });

  container.register(Tokens.CompletePomodoroSessionUseCase, {
    useFactory: (dependencyContainer) =>
      completePomodoroSessionUseCase(dependencyContainer.resolve(Tokens.PomodoroSessionRepository)),
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

  container.register(Tokens.GetDueCardsUseCase, {
    useFactory: (dependencyContainer) =>
      getDueCardsUseCase(
        dependencyContainer.resolve(Tokens.DeckRepository),
        dependencyContainer.resolve(Tokens.CardRepository),
      ),
  });

  container.register(Tokens.ReviewCardUseCase, {
    useFactory: (dependencyContainer) =>
      reviewCardUseCase(
        dependencyContainer.resolve(Tokens.DeckRepository),
        dependencyContainer.resolve(Tokens.CardRepository),
      ),
  });

  container.register(Tokens.GetDueCardsController, {
    useFactory: (dependencyContainer) =>
      getDueCardsController(
        dependencyContainer.resolve(UserTokens.EnsureUserUseCase),
        dependencyContainer.resolve(Tokens.GetDueCardsUseCase),
      ),
  });

  container.register(Tokens.ReviewCardController, {
    useFactory: (dependencyContainer) =>
      reviewCardController(
        dependencyContainer.resolve(UserTokens.EnsureUserUseCase),
        dependencyContainer.resolve(Tokens.ReviewCardUseCase),
      ),
  });

  container.register(Tokens.CreatePomodoroSessionController, {
    useFactory: (dependencyContainer) =>
      createPomodoroSessionController(
        dependencyContainer.resolve(UserTokens.EnsureUserUseCase),
        dependencyContainer.resolve(Tokens.CreatePomodoroSessionUseCase),
      ),
  });

  container.register(Tokens.CompletePomodoroSessionController, {
    useFactory: (dependencyContainer) =>
      completePomodoroSessionController(
        dependencyContainer.resolve(UserTokens.EnsureUserUseCase),
        dependencyContainer.resolve(Tokens.CompletePomodoroSessionUseCase),
      ),
  });
}
