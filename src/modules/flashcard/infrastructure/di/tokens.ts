import type { InjectionToken } from 'tsyringe';
import type { ICardRepository } from '@/modules/flashcard/application/repositories/card.repository.interface';
import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';
import type { ICreateCardUseCase } from '@/modules/flashcard/application/use-cases/create-card.use-case';
import type { ICreateDeckUseCase } from '@/modules/flashcard/application/use-cases/create-deck.use-case';
import type { IDeleteCardUseCase } from '@/modules/flashcard/application/use-cases/delete-card.use-case';
import type { IDeleteDeckUseCase } from '@/modules/flashcard/application/use-cases/delete-deck.use-case';
import type { IGetDeckWithCardsUseCase } from '@/modules/flashcard/application/use-cases/get-deck-with-cards.use-case';
import type { IGetDecksUseCase } from '@/modules/flashcard/application/use-cases/get-decks.use-case';
import type { IUpdateCardUseCase } from '@/modules/flashcard/application/use-cases/update-card.use-case';
import type { IUpdateDeckUseCase } from '@/modules/flashcard/application/use-cases/update-deck.use-case';
import type {
  ICreateCardController,
  IDeleteCardController,
  IUpdateCardController,
} from '@/modules/flashcard/interface-adapters/controllers/card.controller.interface';
import type { ICreateDeckController } from '@/modules/flashcard/interface-adapters/controllers/create-deck.controller.interface';
import type { IGetDeckController } from '@/modules/flashcard/interface-adapters/controllers/get-deck.controller.interface';
import type { IGetDecksController } from '@/modules/flashcard/interface-adapters/controllers/get-decks.controller.interface';
import type {
  IDeleteDeckController,
  IUpdateDeckController,
} from '@/modules/flashcard/interface-adapters/controllers/update-deck.controller.interface';

/** Flashcard module injection tokens. */
export const Tokens = {
  DeckRepository: Symbol('DeckRepository') as InjectionToken<IDeckRepository>,
  CardRepository: Symbol('CardRepository') as InjectionToken<ICardRepository>,
  GetDecksUseCase: Symbol('GetDecksUseCase') as InjectionToken<IGetDecksUseCase>,
  CreateDeckUseCase: Symbol('CreateDeckUseCase') as InjectionToken<ICreateDeckUseCase>,
  UpdateDeckUseCase: Symbol('UpdateDeckUseCase') as InjectionToken<IUpdateDeckUseCase>,
  DeleteDeckUseCase: Symbol('DeleteDeckUseCase') as InjectionToken<IDeleteDeckUseCase>,
  GetDeckWithCardsUseCase: Symbol(
    'GetDeckWithCardsUseCase',
  ) as InjectionToken<IGetDeckWithCardsUseCase>,
  CreateCardUseCase: Symbol('CreateCardUseCase') as InjectionToken<ICreateCardUseCase>,
  UpdateCardUseCase: Symbol('UpdateCardUseCase') as InjectionToken<IUpdateCardUseCase>,
  DeleteCardUseCase: Symbol('DeleteCardUseCase') as InjectionToken<IDeleteCardUseCase>,
  GetDecksController: Symbol('GetDecksController') as InjectionToken<IGetDecksController>,
  CreateDeckController: Symbol('CreateDeckController') as InjectionToken<ICreateDeckController>,
  GetDeckController: Symbol('GetDeckController') as InjectionToken<IGetDeckController>,
  UpdateDeckController: Symbol('UpdateDeckController') as InjectionToken<IUpdateDeckController>,
  DeleteDeckController: Symbol('DeleteDeckController') as InjectionToken<IDeleteDeckController>,
  CreateCardController: Symbol('CreateCardController') as InjectionToken<ICreateCardController>,
  UpdateCardController: Symbol('UpdateCardController') as InjectionToken<IUpdateCardController>,
  DeleteCardController: Symbol('DeleteCardController') as InjectionToken<IDeleteCardController>,
};
