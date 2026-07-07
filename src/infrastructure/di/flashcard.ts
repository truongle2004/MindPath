import { resolve } from '@/infrastructure/di/container';
import { Tokens as FlashcardTokens } from '@/modules/flashcard/infrastructure/di/tokens';

/**
 * Resolves the get-decks controller from the DI container.
 * @returns The get-decks controller.
 */
export function getDecksController() {
  return resolve(FlashcardTokens.GetDecksController);
}

/**
 * Resolves the create-deck controller from the DI container.
 * @returns The create-deck controller.
 */
export function createDeckController() {
  return resolve(FlashcardTokens.CreateDeckController);
}

/**
 * Resolves the get-deck controller from the DI container.
 * @returns The get-deck controller.
 */
export function getDeckController() {
  return resolve(FlashcardTokens.GetDeckController);
}

/**
 * Resolves the update-deck controller from the DI container.
 * @returns The update-deck controller.
 */
export function updateDeckController() {
  return resolve(FlashcardTokens.UpdateDeckController);
}

/**
 * Resolves the delete-deck controller from the DI container.
 * @returns The delete-deck controller.
 */
export function deleteDeckController() {
  return resolve(FlashcardTokens.DeleteDeckController);
}

/**
 * Resolves the create-card controller from the DI container.
 * @returns The create-card controller.
 */
export function createCardController() {
  return resolve(FlashcardTokens.CreateCardController);
}

/**
 * Resolves the update-card controller from the DI container.
 * @returns The update-card controller.
 */
export function updateCardController() {
  return resolve(FlashcardTokens.UpdateCardController);
}

/**
 * Resolves the delete-card controller from the DI container.
 * @returns The delete-card controller.
 */
export function deleteCardController() {
  return resolve(FlashcardTokens.DeleteCardController);
}
