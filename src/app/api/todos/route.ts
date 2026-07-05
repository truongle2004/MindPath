import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { UnauthenticatedError } from '@/core/entities/errors/auth';
import { DatabaseOperationError } from '@/core/entities/errors/common';
import { getTodosController } from '@/infrastructure/di';

/**
 * Returns todos from Supabase or local Postgres through the controller layer.
 * @returns JSON response with todos or an error payload.
 */
export async function GET() {
  const { userId } = await auth();

  try {
    const controller = await getTodosController();
    const body = await controller(userId);

    return NextResponse.json(body);
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof DatabaseOperationError) {
      return NextResponse.json({ error: 'Failed to load todos' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Failed to load todos' }, { status: 500 });
  }
}
