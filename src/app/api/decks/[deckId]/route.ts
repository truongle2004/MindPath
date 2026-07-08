import { NextResponse } from 'next/server';
import { getAuthContext, getErrorMessage, getErrorStatus } from '@/app/api/_utils/auth';
import {
  deleteDeckController,
  getDeckController,
  updateDeckController,
} from '@/infrastructure/di/flashcard';

/**
 * Returns a deck and its cards for the authenticated user.
 * @param _request The incoming request.
 * @param context Route params containing the deck id.
 * @returns JSON response with deck and cards or an error payload.
 */
export async function GET(_request: Request, context: { params: Promise<{ deckId: string }> }) {
  try {
    const { deckId } = await context.params;
    const auth = await getAuthContext();
    const controller = getDeckController();
    const body = await controller(auth, deckId);

    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}

/**
 * Updates a deck for the authenticated user.
 * @param request The incoming request with deck fields in the body.
 * @param context Route params containing the deck id.
 * @returns JSON response with the updated deck or an error payload.
 */
export async function PATCH(request: Request, context: { params: Promise<{ deckId: string }> }) {
  try {
    const { deckId } = await context.params;
    const auth = await getAuthContext();
    const input: unknown = await request.json();
    const controller = updateDeckController();
    const body = await controller(auth, deckId, input);

    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}

/**
 * Deletes a deck for the authenticated user.
 * @param _request The incoming request.
 * @param context Route params containing the deck id.
 * @returns Empty response or an error payload.
 */
export async function DELETE(_request: Request, context: { params: Promise<{ deckId: string }> }) {
  try {
    const { deckId } = await context.params;
    const auth = await getAuthContext();
    const controller = deleteDeckController();
    await controller(auth, deckId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}
