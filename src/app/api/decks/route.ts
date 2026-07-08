import { NextResponse } from 'next/server';
import { getAuthContext, getErrorMessage, getErrorStatus } from '@/app/api/_utils/auth';
import { createDeckController, getDecksController } from '@/infrastructure/di/flashcard';

/**
 * Returns all decks for the authenticated user.
 * @returns JSON response with decks or an error payload.
 */
export async function GET() {
  try {
    const auth = await getAuthContext();
    const controller = getDecksController();
    const body = await controller(auth);

    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}

/**
 * Creates a deck for the authenticated user.
 * @param request The incoming request with deck fields in the body.
 * @returns JSON response with the created deck or an error payload.
 */
export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    const input: unknown = await request.json();
    const controller = createDeckController();
    const body = await controller(auth, input);

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}
