import { NextResponse } from 'next/server';
import { DatabaseOperationError } from '@/core/entities/errors/database-operation-error';
import { UnauthenticatedError } from '@/core/entities/errors/unauthenticated-error';
import { getTodosController } from '@/infrastructure/di';

/**
 * Returns todos from Postgres through the controller layer.
 * @param request The incoming request with a userId query parameter.
 * @returns JSON response with todos or an error payload.
 */
export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get('userId');

  try {
    const controller = getTodosController();
    const body = await controller(userId);

    return NextResponse.json(body);
  } catch (error) {
    console.error('[api/todos] GET failed', error);

    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof DatabaseOperationError) {
      return NextResponse.json({ error: 'Failed to load todos' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Failed to load todos' }, { status: 500 });
  }
}
