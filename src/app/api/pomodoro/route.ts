import { NextResponse } from 'next/server';
import { getAuthContext, getErrorMessage, getErrorStatus } from '@/app/api/_utils/auth';
import { createPomodoroSessionController } from '@/infrastructure/di/flashcard';

/**
 * Starts a Pomodoro session for the authenticated user.
 * @param request The incoming request with Pomodoro session fields in the body.
 * @returns JSON response with the created session or an error payload.
 */
export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    const input: unknown = await request.json();
    const controller = createPomodoroSessionController();
    const body = await controller(auth, input);

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}
