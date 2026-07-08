# FSRS Review Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete spaced-repetition review loop — fetch due cards, flip through them one by one, submit a rating (Again/Hard/Good/Easy), update FSRS scheduling fields on the card, log to `card_reviews`, and show a completion screen.

**Architecture:** FSRS algorithm runs server-side in a new `review-card` use case (using `ts-fsrs`). Two new API routes are added (`GET /api/decks/:id/study` and `POST /api/decks/:id/cards/:id/review`). The study session UI lives in `StudyPageContent` and is fully client-driven — cards fetched once on mount, ratings submitted per card, no page reloads.

**Tech Stack:** ts-fsrs 5.x, Drizzle ORM (lte/and operators), Zod, next-intl, shadcn/ui (Card, Button), Tailwind v4, tsyringe DI.

---

## File Map

**Create:**
- `src/modules/flashcard/application/use-cases/get-due-cards.use-case.ts`
- `src/modules/flashcard/application/use-cases/review-card.use-case.ts`
- `src/modules/flashcard/interface-adapters/controllers/get-due-cards.controller.interface.ts`
- `src/modules/flashcard/interface-adapters/controllers/get-due-cards.controller.ts`
- `src/modules/flashcard/interface-adapters/controllers/review-card.controller.interface.ts`
- `src/modules/flashcard/interface-adapters/controllers/review-card.controller.ts`
- `src/app/api/decks/[deckId]/study/route.ts`
- `src/app/api/decks/[deckId]/cards/[cardId]/review/route.ts`
- `src/app/[locale]/(auth)/dashboard/decks/[deckId]/study/page.tsx`
- `src/components/StudyPageContent.tsx`

**Modify:**
- `src/modules/flashcard/entities/models/card.schema.ts` — add FSRS fields
- `src/modules/flashcard/application/repositories/card.repository.interface.ts` — add `findDueForDeck`, `applyFsrsReview`
- `src/modules/flashcard/infrastructure/repositories/drizzle-card.repository.ts` — implement new methods + update `mapCard`
- `src/modules/flashcard/infrastructure/di/tokens.ts` — add 4 new tokens
- `src/modules/flashcard/infrastructure/di/register.ts` — register new use cases + controllers
- `src/infrastructure/di/flashcard.ts` — expose 2 new resolver functions
- `src/locales/en.json` — add `StudyPage` namespace
- `src/locales/vi.json` — add `StudyPage` namespace
- `src/components/DeckDetailPageContent.tsx` — add "Study" button

---

## Task 1: Install ts-fsrs

**Files:** `package.json` (modified by npm)

- [ ] **Step 1: Install the package**

```bash
npm install ts-fsrs
```

Expected: `added 1 package` (or similar). `package.json` now includes `"ts-fsrs": "^5.x.x"` in `dependencies`.

- [ ] **Step 2: Verify type import works**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: no ts-fsrs import errors (there are no imports yet, so no errors at all related to ts-fsrs).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add ts-fsrs dependency"
```

---

## Task 2: Extend Card entity with FSRS fields

**Files:**
- Modify: `src/modules/flashcard/entities/models/card.schema.ts`

- [ ] **Step 1: Add FSRS fields to cardSchema**

Replace the entire content of `src/modules/flashcard/entities/models/card.schema.ts`:

```typescript
import * as z from 'zod';

export const cardSchema = z.object({
  id: z.string(),
  deckId: z.string(),
  front: z.string(),
  back: z.string(),
  cardType: z.string(),
  createdAt: z.string(),
  state: z.string(),
  stability: z.number(),
  difficulty: z.number(),
  due: z.string(),
  elapsedDays: z.number(),
  scheduledDays: z.number(),
  reps: z.number(),
  lapses: z.number(),
  lastReview: z.string().nullable(),
});

export const createCardInputSchema = z.object({
  front: z.string().trim().min(1).max(2000),
  back: z.string().trim().min(1).max(2000),
});

export const updateCardInputSchema = createCardInputSchema.partial();

export const reviewCardInputSchema = z.object({
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export type CreateCardInput = z.infer<typeof createCardInputSchema>;
export type UpdateCardInput = z.infer<typeof updateCardInputSchema>;
export type ReviewCardInput = z.infer<typeof reviewCardInputSchema>;
```

- [ ] **Step 2: Check types compile**

```bash
npm run check:types
```

Expected: may show errors in `drizzle-card.repository.ts` because `mapCard` returns the old shape — these will be fixed in Task 4.

---

## Task 3: Extend ICardRepository interface

**Files:**
- Modify: `src/modules/flashcard/application/repositories/card.repository.interface.ts`

- [ ] **Step 1: Add new method signatures**

Replace the entire file content:

```typescript
import type { Card } from '@/modules/flashcard/entities/models/card';
import type {
  CreateCardInput,
  UpdateCardInput,
} from '@/modules/flashcard/entities/models/card.schema';

export type FsrsUpdate = {
  stability: number;
  difficulty: number;
  due: Date;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: string;
  lastReview: Date;
};

export type CardReviewEntry = {
  cardId: string;
  userId: string;
  rating: number;
  stabilityBefore: number;
  stabilityAfter: number;
  difficultyAfter: number;
  scheduledDays: number;
};

export type ICardRepository = {
  findByDeckId: (deckId: string) => Promise<Card[]>;
  findByIdForDeck: (cardId: string, deckId: string) => Promise<Card | null>;
  findDueForDeck: (deckId: string) => Promise<Card[]>;
  create: (deckId: string, input: CreateCardInput) => Promise<Card>;
  update: (cardId: string, deckId: string, input: UpdateCardInput) => Promise<Card | null>;
  applyFsrsReview: (cardId: string, deckId: string, fsrsUpdate: FsrsUpdate, reviewEntry: CardReviewEntry) => Promise<Card | null>;
  delete: (cardId: string, deckId: string) => Promise<boolean>;
};
```

- [ ] **Step 2: Verify the interface file compiles in isolation**

```bash
npm run check:types 2>&1 | head -40
```

Expected: errors only in `drizzle-card.repository.ts` (missing `findDueForDeck` and `applyFsrsReview` implementations) — fixed in Task 4.

---

## Task 4: Implement new methods in DrizzleCardRepository

**Files:**
- Modify: `src/modules/flashcard/infrastructure/repositories/drizzle-card.repository.ts`

- [ ] **Step 1: Replace the entire file**

```typescript
import { and, eq, lte } from 'drizzle-orm';
import { DatabaseOperationError } from '@/core/entities/errors/database-operation-error';
import type {
  CardReviewEntry,
  FsrsUpdate,
  ICardRepository,
} from '@/modules/flashcard/application/repositories/card.repository.interface';
import type { Card } from '@/modules/flashcard/entities/models/card';
import { cardsSchema } from '@/modules/flashcard/infrastructure/schema/cards';
import { cardReviewsSchema } from '@/modules/gamification/infrastructure/schema/gamification';
import type { DbClient } from '@/utils/DBConnection';

function mapCard(row: typeof cardsSchema.$inferSelect): Card {
  return {
    id: row.id,
    deckId: row.deckId,
    front: row.front,
    back: row.back,
    cardType: row.cardType,
    createdAt: row.createdAt.toISOString(),
    state: row.state,
    stability: row.stability,
    difficulty: row.difficulty,
    due: row.due.toISOString(),
    elapsedDays: row.elapsedDays,
    scheduledDays: row.scheduledDays,
    reps: row.reps,
    lapses: row.lapses,
    lastReview: row.lastReview?.toISOString() ?? null,
  };
}

/**
 * Creates a Drizzle-backed card repository.
 * @param db The database client.
 * @returns A card repository instance.
 */
export const createDrizzleCardRepository = (db: DbClient): ICardRepository => ({
  findByDeckId: async (deckId) => {
    const rows = await db
      .select()
      .from(cardsSchema)
      .where(eq(cardsSchema.deckId, deckId))
      .orderBy(cardsSchema.createdAt);

    return rows.map(mapCard);
  },

  findByIdForDeck: async (cardId, deckId) => {
    const rows = await db.select().from(cardsSchema).where(eq(cardsSchema.id, cardId)).limit(1);
    const [row] = rows;

    if (!row || row.deckId !== deckId) {
      return null;
    }

    return mapCard(row);
  },

  findDueForDeck: async (deckId) => {
    const now = new Date();
    const rows = await db
      .select()
      .from(cardsSchema)
      .where(and(eq(cardsSchema.deckId, deckId), lte(cardsSchema.due, now)))
      .orderBy(cardsSchema.due);

    return rows.map(mapCard);
  },

  create: async (deckId, input) => {
    try {
      const rows = await db
        .insert(cardsSchema)
        .values({ deckId, front: input.front, back: input.back })
        .returning();

      const [row] = rows;

      if (!row) {
        throw new DatabaseOperationError('Failed to create card');
      }

      return mapCard(row);
    } catch {
      throw new DatabaseOperationError('Failed to create card');
    }
  },

  update: async (cardId, deckId, input) => {
    const existing = await db.select().from(cardsSchema).where(eq(cardsSchema.id, cardId)).limit(1);
    const [card] = existing;

    if (!card || card.deckId !== deckId) {
      return null;
    }

    const updates: Partial<typeof cardsSchema.$inferInsert> = {};

    if (input.front !== undefined) {
      updates.front = input.front;
    }

    if (input.back !== undefined) {
      updates.back = input.back;
    }

    try {
      const rows = await db
        .update(cardsSchema)
        .set(updates)
        .where(eq(cardsSchema.id, cardId))
        .returning();

      const [row] = rows;

      if (!row) {
        throw new DatabaseOperationError('Failed to update card');
      }

      return mapCard(row);
    } catch {
      throw new DatabaseOperationError('Failed to update card');
    }
  },

  applyFsrsReview: async (cardId, deckId, fsrsUpdate, reviewEntry) => {
    const existing = await db.select().from(cardsSchema).where(eq(cardsSchema.id, cardId)).limit(1);
    const [card] = existing;

    if (!card || card.deckId !== deckId) {
      return null;
    }

    try {
      const [updatedCard] = await db
        .update(cardsSchema)
        .set({
          stability: fsrsUpdate.stability,
          difficulty: fsrsUpdate.difficulty,
          due: fsrsUpdate.due,
          elapsedDays: fsrsUpdate.elapsedDays,
          scheduledDays: fsrsUpdate.scheduledDays,
          reps: fsrsUpdate.reps,
          lapses: fsrsUpdate.lapses,
          state: fsrsUpdate.state,
          lastReview: fsrsUpdate.lastReview,
        })
        .where(eq(cardsSchema.id, cardId))
        .returning();

      if (!updatedCard) {
        throw new DatabaseOperationError('Failed to update card FSRS state');
      }

      await db.insert(cardReviewsSchema).values({
        cardId: reviewEntry.cardId,
        userId: reviewEntry.userId,
        rating: reviewEntry.rating,
        stabilityBefore: reviewEntry.stabilityBefore,
        stabilityAfter: reviewEntry.stabilityAfter,
        difficultyAfter: reviewEntry.difficultyAfter,
        scheduledDays: reviewEntry.scheduledDays,
      });

      return mapCard(updatedCard);
    } catch {
      throw new DatabaseOperationError('Failed to apply FSRS review');
    }
  },

  delete: async (cardId, deckId) => {
    const rows = await db
      .delete(cardsSchema)
      .where(eq(cardsSchema.id, cardId))
      .returning({ id: cardsSchema.id, deckId: cardsSchema.deckId });

    const [row] = rows;

    if (!row || row.deckId !== deckId) {
      return false;
    }

    return true;
  },
});
```

- [ ] **Step 2: Check types compile**

```bash
npm run check:types 2>&1 | head -40
```

Expected: `drizzle-card.repository.ts` errors resolved. Remaining errors (if any) will be in use-case files not yet created.

- [ ] **Step 3: Commit**

```bash
git add src/modules/flashcard/entities/models/card.schema.ts \
        src/modules/flashcard/application/repositories/card.repository.interface.ts \
        src/modules/flashcard/infrastructure/repositories/drizzle-card.repository.ts
git commit -m "feat: extend Card entity with FSRS fields and add review repo methods"
```

---

## Task 5: get-due-cards use case

**Files:**
- Create: `src/modules/flashcard/application/use-cases/get-due-cards.use-case.ts`

- [ ] **Step 1: Create the file**

```typescript
import { NotFoundError } from '@/core/entities/errors/not-found-error';
import type { ICardRepository } from '@/modules/flashcard/application/repositories/card.repository.interface';
import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';
import type { Card } from '@/modules/flashcard/entities/models/card';

export type IGetDueCardsUseCase = (deckId: string, userId: string) => Promise<Card[]>;

/**
 * Returns cards due for review in a deck owned by the user.
 * @param deckRepository The deck repository.
 * @param cardRepository The card repository.
 * @returns The get-due-cards use case.
 */
export const getDueCardsUseCase =
  (deckRepository: IDeckRepository, cardRepository: ICardRepository): IGetDueCardsUseCase =>
  async (deckId, userId) => {
    const deck = await deckRepository.findByIdForUser(deckId, userId);

    if (!deck) {
      throw new NotFoundError('Deck not found');
    }

    return cardRepository.findDueForDeck(deckId);
  };
```

---

## Task 6: review-card use case

**Files:**
- Create: `src/modules/flashcard/application/use-cases/review-card.use-case.ts`

- [ ] **Step 1: Create the file**

```typescript
import { fsrs, Rating, State } from 'ts-fsrs';
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
    case 'learning': return State.Learning;
    case 'review': return State.Review;
    case 'relearning': return State.Relearning;
    default: return State.New;
  }
}

function stateToString(state: State): string {
  switch (state) {
    case State.Learning: return 'learning';
    case State.Review: return 'review';
    case State.Relearning: return 'relearning';
    default: return 'new';
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
      reps: card.reps,
      lapses: card.lapses,
      state: stateFromString(card.state),
      last_review: card.lastReview ? new Date(card.lastReview) : undefined,
    };

    const scheduling = f.repeat(fsrsCard, now);
    const result = scheduling[input.rating as Rating];
    const newCard = result.card;

    const updated = await cardRepository.applyFsrsReview(
      cardId,
      deckId,
      {
        stability: newCard.stability,
        difficulty: newCard.difficulty,
        due: newCard.due,
        elapsedDays: newCard.elapsed_days,
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
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/flashcard/application/use-cases/get-due-cards.use-case.ts \
        src/modules/flashcard/application/use-cases/review-card.use-case.ts
git commit -m "feat: add get-due-cards and review-card use cases with FSRS scheduling"
```

---

## Task 7: Controllers (interfaces + implementations)

**Files:**
- Create: `src/modules/flashcard/interface-adapters/controllers/get-due-cards.controller.interface.ts`
- Create: `src/modules/flashcard/interface-adapters/controllers/get-due-cards.controller.ts`
- Create: `src/modules/flashcard/interface-adapters/controllers/review-card.controller.interface.ts`
- Create: `src/modules/flashcard/interface-adapters/controllers/review-card.controller.ts`

- [ ] **Step 1: Create get-due-cards controller interface**

`src/modules/flashcard/interface-adapters/controllers/get-due-cards.controller.interface.ts`:

```typescript
import type { Card } from '@/modules/flashcard/entities/models/card';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';

export type GetDueCardsResponse = {
  cards: Card[];
};

export type IGetDueCardsController = (
  auth: AuthContext | null,
  deckId: string,
) => Promise<GetDueCardsResponse>;
```

- [ ] **Step 2: Create get-due-cards controller**

`src/modules/flashcard/interface-adapters/controllers/get-due-cards.controller.ts`:

```typescript
import type { IGetDueCardsUseCase } from '@/modules/flashcard/application/use-cases/get-due-cards.use-case';
import type {
  GetDueCardsResponse,
  IGetDueCardsController,
} from '@/modules/flashcard/interface-adapters/controllers/get-due-cards.controller.interface';
import type { IEnsureUserUseCase } from '@/modules/user/application/use-cases/ensure-user.use-case';
import { resolveUserId } from '@/modules/user/interface-adapters/resolve-user-id';

/**
 * Returns cards due for review in a deck for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param getDueCardsUseCase The get-due-cards use case.
 * @returns The get-due-cards controller.
 */
export const getDueCardsController =
  (
    ensureUserUseCase: IEnsureUserUseCase,
    getDueCardsUseCase: IGetDueCardsUseCase,
  ): IGetDueCardsController =>
  async (auth, deckId): Promise<GetDueCardsResponse> => {
    const userId = await resolveUserId(ensureUserUseCase, auth);
    const cards = await getDueCardsUseCase(deckId, userId);

    return { cards };
  };
```

- [ ] **Step 3: Create review-card controller interface**

`src/modules/flashcard/interface-adapters/controllers/review-card.controller.interface.ts`:

```typescript
import type { Card } from '@/modules/flashcard/entities/models/card';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';

export type ReviewCardResponse = {
  card: Card;
};

export type IReviewCardController = (
  auth: AuthContext | null,
  deckId: string,
  cardId: string,
  input: unknown,
) => Promise<ReviewCardResponse>;
```

- [ ] **Step 4: Create review-card controller**

`src/modules/flashcard/interface-adapters/controllers/review-card.controller.ts`:

```typescript
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
```

---

## Task 8: DI wiring

**Files:**
- Modify: `src/modules/flashcard/infrastructure/di/tokens.ts`
- Modify: `src/modules/flashcard/infrastructure/di/register.ts`
- Modify: `src/infrastructure/di/flashcard.ts`

- [ ] **Step 1: Add tokens**

In `src/modules/flashcard/infrastructure/di/tokens.ts`, add 4 new imports and 4 new token entries.

Add to the import block (after existing imports):
```typescript
import type { IGetDueCardsUseCase } from '@/modules/flashcard/application/use-cases/get-due-cards.use-case';
import type { IReviewCardUseCase } from '@/modules/flashcard/application/use-cases/review-card.use-case';
import type { IGetDueCardsController } from '@/modules/flashcard/interface-adapters/controllers/get-due-cards.controller.interface';
import type { IReviewCardController } from '@/modules/flashcard/interface-adapters/controllers/review-card.controller.interface';
```

Add to the `Tokens` object (after `DeleteCardController`):
```typescript
  GetDueCardsUseCase: Symbol('GetDueCardsUseCase') as InjectionToken<IGetDueCardsUseCase>,
  ReviewCardUseCase: Symbol('ReviewCardUseCase') as InjectionToken<IReviewCardUseCase>,
  GetDueCardsController: Symbol('GetDueCardsController') as InjectionToken<IGetDueCardsController>,
  ReviewCardController: Symbol('ReviewCardController') as InjectionToken<IReviewCardController>,
```

- [ ] **Step 2: Register in DI container**

In `src/modules/flashcard/infrastructure/di/register.ts`, add to the import block:
```typescript
import { getDueCardsUseCase } from '@/modules/flashcard/application/use-cases/get-due-cards.use-case';
import { reviewCardUseCase } from '@/modules/flashcard/application/use-cases/review-card.use-case';
import { getDueCardsController } from '@/modules/flashcard/interface-adapters/controllers/get-due-cards.controller';
import { reviewCardController } from '@/modules/flashcard/interface-adapters/controllers/review-card.controller';
```

Add at the end of `registerFlashcardModule` function (before the closing `}`):
```typescript
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
```

- [ ] **Step 3: Add resolver functions**

In `src/infrastructure/di/flashcard.ts`, add at the end of the file:

```typescript
/**
 * Resolves the get-due-cards controller from the DI container.
 * @returns The get-due-cards controller.
 */
export function getDueCardsController() {
  return resolve(FlashcardTokens.GetDueCardsController);
}

/**
 * Resolves the review-card controller from the DI container.
 * @returns The review-card controller.
 */
export function reviewCardController() {
  return resolve(FlashcardTokens.ReviewCardController);
}
```

- [ ] **Step 4: Check types**

```bash
npm run check:types 2>&1 | head -40
```

Expected: 0 errors (or only pre-existing errors unrelated to this feature).

- [ ] **Step 5: Commit**

```bash
git add src/modules/flashcard/application/use-cases/get-due-cards.use-case.ts \
        src/modules/flashcard/application/use-cases/review-card.use-case.ts \
        src/modules/flashcard/interface-adapters/controllers/ \
        src/modules/flashcard/infrastructure/di/tokens.ts \
        src/modules/flashcard/infrastructure/di/register.ts \
        src/infrastructure/di/flashcard.ts
git commit -m "feat: wire FSRS get-due-cards and review-card through DI"
```

---

## Task 9: API routes

**Files:**
- Create: `src/app/api/decks/[deckId]/study/route.ts`
- Create: `src/app/api/decks/[deckId]/cards/[cardId]/review/route.ts`

- [ ] **Step 1: Create GET /api/decks/[deckId]/study**

`src/app/api/decks/[deckId]/study/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getAuthContext, getErrorMessage, getErrorStatus } from '@/app/api/_utils/auth';
import { getDueCardsController } from '@/infrastructure/di/flashcard';

/**
 * Returns cards due for review in a deck for the authenticated user.
 * @param _request The incoming request.
 * @param context Route params containing the deck id.
 * @returns JSON response with due cards or an error payload.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ deckId: string }> },
) {
  try {
    const { deckId } = await context.params;
    const auth = await getAuthContext();
    const controller = getDueCardsController();
    const body = await controller(auth, deckId);

    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}
```

- [ ] **Step 2: Create POST /api/decks/[deckId]/cards/[cardId]/review**

`src/app/api/decks/[deckId]/cards/[cardId]/review/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getAuthContext, getErrorMessage, getErrorStatus } from '@/app/api/_utils/auth';
import { reviewCardController } from '@/infrastructure/di/flashcard';

/**
 * Submits a review rating for a card and updates its FSRS schedule.
 * @param request The incoming request with rating in the body.
 * @param context Route params containing the deck and card ids.
 * @returns JSON response with the updated card or an error payload.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ deckId: string; cardId: string }> },
) {
  try {
    const { deckId, cardId } = await context.params;
    const auth = await getAuthContext();
    const input: unknown = await request.json();
    const controller = reviewCardController();
    const body = await controller(auth, deckId, cardId, input);

    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}
```

- [ ] **Step 3: Verify types**

```bash
npm run check:types 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/decks/
git commit -m "feat: add study and review API routes"
```

---

## Task 10: i18n strings

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/vi.json`

- [ ] **Step 1: Add StudyPage namespace to en.json**

Add after `"DeckDetailPage": { ... }` (before the final `}`):

```json
  "StudyPage": {
    "meta_title": "Study",
    "meta_description": "Review flashcards with spaced repetition.",
    "loading_message": "Loading cards…",
    "error_message": "Could not load cards.",
    "no_cards_title": "No cards due",
    "no_cards_description": "All caught up! Come back later to review more.",
    "back_to_deck": "Back to deck",
    "progress": "{current} / {total}",
    "show_answer": "Show answer",
    "rating_again": "Again",
    "rating_hard": "Hard",
    "rating_good": "Good",
    "rating_easy": "Easy",
    "submitting": "Saving…",
    "done_title": "Session complete",
    "done_description": "{count, plural, =1 {1 card reviewed} other {# cards reviewed}}",
    "done_again": "Again: {count}",
    "done_hard": "Hard: {count}",
    "done_good": "Good: {count}",
    "done_easy": "Easy: {count}",
    "study_again": "Study again"
  }
```

- [ ] **Step 2: Add StudyPage namespace to vi.json**

Add the same namespace in Vietnamese (after `"DeckDetailPage": { ... }` before the final `}`):

```json
  "StudyPage": {
    "meta_title": "Học",
    "meta_description": "Ôn tập thẻ ghi nhớ với lịch học thông minh.",
    "loading_message": "Đang tải thẻ…",
    "error_message": "Không thể tải thẻ.",
    "no_cards_title": "Không có thẻ cần ôn",
    "no_cards_description": "Bạn đã hoàn thành tất cả! Quay lại sau để ôn tiếp.",
    "back_to_deck": "Quay lại bộ thẻ",
    "progress": "{current} / {total}",
    "show_answer": "Xem đáp án",
    "rating_again": "Lại",
    "rating_hard": "Khó",
    "rating_good": "Ổn",
    "rating_easy": "Dễ",
    "submitting": "Đang lưu…",
    "done_title": "Hoàn thành buổi học",
    "done_description": "{count, plural, =1 {1 thẻ đã ôn} other {# thẻ đã ôn}}",
    "done_again": "Lại: {count}",
    "done_hard": "Khó: {count}",
    "done_good": "Ổn: {count}",
    "done_easy": "Dễ: {count}",
    "study_again": "Học lại"
  }
```

- [ ] **Step 3: Check i18n**

```bash
npm run check:i18n
```

Expected: 0 missing keys.

- [ ] **Step 4: Commit**

```bash
git add src/locales/
git commit -m "feat: add StudyPage i18n strings (en + vi)"
```

---

## Task 11: Study page + StudyPageContent component

**Files:**
- Create: `src/app/[locale]/(auth)/dashboard/decks/[deckId]/study/page.tsx`
- Create: `src/components/StudyPageContent.tsx`

- [ ] **Step 1: Create the server page**

`src/app/[locale]/(auth)/dashboard/decks/[deckId]/study/page.tsx`:

```typescript
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StudyPageContent } from '@/components/StudyPageContent';

type StudyPageProps = {
  params: Promise<{ locale: string; deckId: string }>;
};

export async function generateMetadata(props: StudyPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'StudyPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function StudyPage(props: StudyPageProps) {
  const { locale, deckId } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <StudyPageContent deckId={deckId} />
    </div>
  );
}
```

- [ ] **Step 2: Create StudyPageContent**

`src/components/StudyPageContent.tsx`:

```typescript
'use client';

import { ArrowLeft, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/libs/I18nNavigation';
import type { Card } from '@/modules/flashcard/entities/models/card';

type StudyPageContentProps = {
  deckId: string;
};

type Phase = 'loading' | 'error' | 'empty' | 'question' | 'answer' | 'submitting' | 'done';

type Results = { again: number; hard: number; good: number; easy: number };

const RATING_LABELS = ['again', 'hard', 'good', 'easy'] as const;
const RATING_VALUES = [1, 2, 3, 4] as const;
const RATING_VARIANTS = ['destructive', 'outline', 'default', 'secondary'] as const;

/**
 * Full-page study session component that presents due cards one by one for review.
 * @param props The deck id from the route.
 * @returns The study session UI.
 */
export function StudyPageContent(props: StudyPageContentProps) {
  const t = useTranslations('StudyPage');
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const [results, setResults] = useState<Results>({ again: 0, hard: 0, good: 0, easy: 0 });

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/decks/${props.deckId}/study`);

        if (!response.ok) {
          setPhase('error');
          return;
        }

        const body = await response.json() as { cards: Card[] };

        if (body.cards.length === 0) {
          setPhase('empty');
          return;
        }

        setCards(body.cards);
        setPhase('question');
      } catch {
        setPhase('error');
      }
    }

    void load();
  }, [props.deckId]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (phase === 'question' && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault();
        setPhase('answer');
      }

      if (phase === 'answer') {
        if (event.key === '1') void submitRating(1);
        if (event.key === '2') void submitRating(2);
        if (event.key === '3') void submitRating(3);
        if (event.key === '4') void submitRating(4);
      }
    }

    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  // submitRating is stable within a card; deps are index and phase
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  async function submitRating(rating: 1 | 2 | 3 | 4) {
    const card = cards[index];

    if (!card) {
      return;
    }

    setPhase('submitting');

    try {
      await fetch(`/api/decks/${props.deckId}/cards/${card.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
    } catch {
      // swallow — still advance so the session continues
    }

    const ratingKey = RATING_LABELS[rating - 1];

    if (ratingKey) {
      setResults((prev) => ({ ...prev, [ratingKey]: prev[ratingKey] + 1 }));
    }

    const nextIndex = index + 1;

    if (nextIndex >= cards.length) {
      setPhase('done');
    } else {
      setIndex(nextIndex);
      setPhase('question');
    }
  }

  const card = cards[index];
  const total = cards.length;
  const backHref = `/dashboard/decks/${props.deckId}` as const;

  if (phase === 'loading') {
    return <p className="text-muted-foreground">{t('loading_message')}</p>;
  }

  if (phase === 'error') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t('error_message')}</p>
        <Button variant="outline" asChild className="w-fit">
          <Link href={backHref}>
            <ArrowLeft data-icon="inline-start" />
            {t('back_to_deck')}
          </Link>
        </Button>
      </div>
    );
  }

  if (phase === 'empty') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Check className="size-10 text-muted-foreground" />
        <div>
          <h2 className="text-xl font-semibold">{t('no_cards_title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('no_cards_description')}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={backHref}>
            <ArrowLeft data-icon="inline-start" />
            {t('back_to_deck')}
          </Link>
        </Button>
      </div>
    );
  }

  if (phase === 'done') {
    const reviewed = results.again + results.hard + results.good + results.easy;

    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div>
          <h2 className="text-2xl font-semibold">{t('done_title')}</h2>
          <p className="mt-1 text-muted-foreground">{t('done_description', { count: reviewed })}</p>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>{t('done_again', { count: results.again })}</span>
          <span>{t('done_hard', { count: results.hard })}</span>
          <span>{t('done_good', { count: results.good })}</span>
          <span>{t('done_easy', { count: results.easy })}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={backHref}>
              <ArrowLeft data-icon="inline-start" />
              {t('back_to_deck')}
            </Link>
          </Button>
          <Button
            onClick={() => {
              setIndex(0);
              setResults({ again: 0, hard: 0, good: 0, easy: 0 });
              setPhase('question');
            }}
          >
            {t('study_again')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="w-fit" asChild>
          <Link href={backHref}>
            <ArrowLeft data-icon="inline-start" />
            {t('back_to_deck')}
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          {t('progress', { current: index + 1, total })}
        </span>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-lg font-semibold whitespace-pre-wrap">{card?.front}</p>
        </div>

        {(phase === 'answer' || phase === 'submitting') && (
          <>
            <div className="h-px w-full bg-border" />
            <div className="flex min-h-32 flex-col items-center justify-center p-8 text-center">
              <p className="text-base whitespace-pre-wrap text-muted-foreground">{card?.back}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-center gap-2">
        {phase === 'question' && (
          <Button
            onClick={() => {
              setPhase('answer');
            }}
          >
            {t('show_answer')}
          </Button>
        )}

        {phase === 'answer' &&
          RATING_VALUES.map((rating, i) => (
            <Button
              key={rating}
              variant={RATING_VARIANTS[i]}
              onClick={() => {
                void submitRating(rating);
              }}
            >
              {t(RATING_LABELS[i] === 'again' ? 'rating_again'
                : RATING_LABELS[i] === 'hard' ? 'rating_hard'
                : RATING_LABELS[i] === 'good' ? 'rating_good'
                : 'rating_easy')}
            </Button>
          ))}

        {phase === 'submitting' && (
          <Button disabled>{t('submitting')}</Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify types**

```bash
npm run check:types 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/\(auth\)/dashboard/decks/\[deckId\]/study/ \
        src/components/StudyPageContent.tsx
git commit -m "feat: add study session page with card flip and FSRS rating UI"
```

---

## Task 12: Study button on DeckDetailPage

**Files:**
- Modify: `src/components/DeckDetailPageContent.tsx`

- [ ] **Step 1: Add "Study" button to the deck header action area**

In `src/components/DeckDetailPageContent.tsx`:

1. Add `BookOpen` to the existing `lucide-react` import:
```typescript
import { ArrowLeft, BookOpen, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
```

2. In the deck header action area (the `<div className="flex flex-wrap items-center gap-2">` that contains the delete controls), add the Study button **before** the delete confirmation block:

```typescript
<Button asChild>
  <Link href={`/dashboard/decks/${props.deckId}/study`}>
    <BookOpen data-icon="inline-start" />
    {t('study_button')}
  </Link>
</Button>
```

3. Add the translation key to `en.json` and `vi.json`:

In `en.json` under `"DeckDetailPage"`:
```json
"study_button": "Study"
```

In `vi.json` under `"DeckDetailPage"`:
```json
"study_button": "Học"
```

- [ ] **Step 2: Verify types and i18n**

```bash
npm run check:types 2>&1 | head -20
npm run check:i18n
```

Expected: 0 errors, 0 missing keys.

- [ ] **Step 3: Commit**

```bash
git add src/components/DeckDetailPageContent.tsx src/locales/
git commit -m "feat: add Study button to deck detail page"
```

---

## Task 13: Final verification

- [ ] **Step 1: Build check**

```bash
npm run build-local
```

Expected: build completes with 0 errors.

- [ ] **Step 2: Manual smoke test**

With `npm run dev` running:

1. Navigate to a deck with at least 1 card → "Study" button is visible
2. Click "Study" → loads `/dashboard/decks/:id/study`
3. Card front shown → click "Show answer" → back appears, 4 rating buttons appear
4. Click "Good" → advances to next card (or shows completion screen)
5. On completion screen → stats shown, "Back to deck" works, "Study again" restarts session
6. Check DB: `cards` table shows updated `stability`, `difficulty`, `due`, `state`, `reps`; `card_reviews` table has a new row

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Expected: 0 errors.
