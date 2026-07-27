import { NextResponse } from 'next/server';
import { getAuthContext, getErrorMessage, getErrorStatus } from '@/app/api/_utils/auth';
import { completePomodoroSessionController } from '@/infrastructure/di/flashcard';

/**
 * Completes a Pomodoro session for the authenticated user.
 * @param request The incoming request with completion fields in the body.
 * @param context Route params containing the Pomodoro session id.
 * @returns JSON response with the completed session or an error payload.
 */
export async function PATCH(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await context.params;
    const auth = await getAuthContext();
    const input: unknown = await request.json();
    const controller = completePomodoroSessionController();
    const body = await controller(auth, sessionId, input);

    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}
