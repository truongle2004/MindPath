import { NextResponse } from 'next/server';
import { getAuthContext, getErrorMessage, getErrorStatus } from '@/app/api/_utils/auth';
import { createCardController } from '@/infrastructure/di/flashcard';

/**
 * Creates a card in a deck for the authenticated user.
 * @param request The incoming request with card fields in the body.
 * @param context Route params containing the deck id.
 * @returns JSON response with the created card or an error payload.
 */
export async function POST(request: Request, context: { params: Promise<{ deckId: string }> }) {
  try {
    const { deckId } = await context.params;
    const auth = await getAuthContext();
    const input: unknown = await request.json();
    const controller = createCardController();
    const body = await controller(auth, deckId, input);

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}
