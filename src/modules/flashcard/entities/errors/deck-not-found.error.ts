export class DeckNotFoundError extends Error {
  constructor(deckId: string) {
    super(`Deck not found: ${deckId}`);
    this.name = 'DeckNotFoundError';
  }
}
