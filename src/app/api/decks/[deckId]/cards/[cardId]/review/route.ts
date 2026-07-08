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
