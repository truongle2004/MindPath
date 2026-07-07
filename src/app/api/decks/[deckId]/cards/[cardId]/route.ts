import { NextResponse } from 'next/server';
import { getAuthContext, getErrorMessage, getErrorStatus } from '@/app/api/_utils/auth';
import { deleteCardController, updateCardController } from '@/infrastructure/di/flashcard';

/**
 * Updates a card in a deck for the authenticated user.
 * @param request The incoming request with card fields in the body.
 * @param context Route params containing the deck and card ids.
 * @returns JSON response with the updated card or an error payload.
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ deckId: string; cardId: string }> },
) {
  try {
    const { deckId, cardId } = await context.params;
    const auth = await getAuthContext();
    const input: unknown = await request.json();
    const controller = updateCardController();
    const body = await controller(auth, deckId, cardId, input);

    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}

/**
 * Deletes a card from a deck for the authenticated user.
 * @param _request The incoming request.
 * @param context Route params containing the deck and card ids.
 * @returns Empty response or an error payload.
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ deckId: string; cardId: string }> },
) {
  try {
    const { deckId, cardId } = await context.params;
    const auth = await getAuthContext();
    const controller = deleteCardController();
    await controller(auth, deckId, cardId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}
