import * as z from 'zod';
import { httpJson } from '@/libs/Fetcher';
import { cardSchema } from '@/modules/flashcard/entities/models/card.schema';
import {
  createDeckResponseSchema,
  getDecksResponseSchema,
  deckSchema,
} from '@/modules/flashcard/entities/models/deck.schema';
import type {
  CreateCardDto,
  CreateCardResponseDto,
  CreateDeckDto,
  CreateDeckResponseDto,
  DeleteResponseDto,
  DeckWithCardsDto,
  GetDecksResponseDto,
  ReviewCardDto,
  ReviewCardResponseDto,
  StudyCardsResponseDto,
  UpdateCardDto,
  UpdateCardResponseDto,
} from './decks.types';

const deckWithCardsResponseSchema = z.object({
  deck: deckSchema,
  cards: z.array(cardSchema),
});

const cardResponseSchema = z.object({
  card: cardSchema,
});

const studyCardsResponseSchema = z.object({
  cards: z.array(cardSchema),
});

const deleteResponseSchema = z.null();

export async function getDecks(): Promise<GetDecksResponseDto> {
  return await httpJson('/api/decks', {
    schema: getDecksResponseSchema,
  });
}

export async function getDeck(props: { deckId: string }): Promise<DeckWithCardsDto> {
  return await httpJson(`/api/decks/${props.deckId}`, {
    schema: deckWithCardsResponseSchema,
  });
}

export async function createDeck(props: { input: CreateDeckDto }): Promise<CreateDeckResponseDto> {
  return await httpJson('/api/decks', {
    method: 'POST',
    schema: createDeckResponseSchema,
    body: props.input,
  });
}

export async function deleteDeck(props: { deckId: string }): Promise<DeleteResponseDto> {
  return await httpJson(`/api/decks/${props.deckId}`, {
    method: 'DELETE',
    schema: deleteResponseSchema,
  });
}

export async function createCard(props: {
  deckId: string;
  input: CreateCardDto;
}): Promise<CreateCardResponseDto> {
  return await httpJson(`/api/decks/${props.deckId}/cards`, {
    method: 'POST',
    schema: cardResponseSchema,
    body: props.input,
  });
}

export async function updateCard(props: {
  deckId: string;
  cardId: string;
  input: UpdateCardDto;
}): Promise<UpdateCardResponseDto> {
  return await httpJson(`/api/decks/${props.deckId}/cards/${props.cardId}`, {
    method: 'PATCH',
    schema: cardResponseSchema,
    body: props.input,
  });
}

export async function deleteCard(props: {
  deckId: string;
  cardId: string;
}): Promise<DeleteResponseDto> {
  return await httpJson(`/api/decks/${props.deckId}/cards/${props.cardId}`, {
    method: 'DELETE',
    schema: deleteResponseSchema,
  });
}

export async function getStudyCards(props: { deckId: string }): Promise<StudyCardsResponseDto> {
  return await httpJson(`/api/decks/${props.deckId}/study`, {
    schema: studyCardsResponseSchema,
  });
}

export async function reviewCard(props: {
  deckId: string;
  cardId: string;
  input: ReviewCardDto;
}): Promise<ReviewCardResponseDto> {
  return await httpJson(`/api/decks/${props.deckId}/cards/${props.cardId}/review`, {
    method: 'POST',
    schema: cardResponseSchema,
    body: props.input,
  });
}
