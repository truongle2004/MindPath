import { NextResponse } from 'next/server';
import { getAuthContext, getErrorMessage, getErrorStatus } from '@/app/api/_utils/auth';
import { getDueCardsController } from '@/infrastructure/di/flashcard';

/**
 * Returns cards due for review in a deck for the authenticated user.
 * @param _request The incoming request.
 * @param context Route params containing the deck id.
 * @returns JSON response with due cards or an error payload.
 */
export async function GET(_request: Request, context: { params: Promise<{ deckId: string }> }) {
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
