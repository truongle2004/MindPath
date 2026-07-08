import { auth, currentUser } from '@clerk/nextjs/server';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';

/**
 * Builds an auth context from the current Clerk session.
 * @returns The auth context or null when unauthenticated.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await auth();
  const user = await currentUser();

  if (!session.userId || !user) {
    return null;
  }

  const email = user.primaryEmailAddress?.emailAddress;

  if (!email) {
    return null;
  }

  return {
    clerkId: session.userId,
    email,
    username: user.username,
  };
}

/**
 * Maps controller errors to HTTP status codes.
 * @param error The thrown error.
 * @returns The HTTP status code.
 */
export function getErrorStatus(error: unknown): number {
  if (error instanceof Error) {
    if (error.name === 'UnauthenticatedError') {
      return 401;
    }

    if (error.name === 'UnauthorizedError') {
      return 403;
    }

    if (error.name === 'NotFoundError') {
      return 404;
    }

    if (error.name === 'InputParseError') {
      return 400;
    }

    if (error.name === 'DatabaseOperationError') {
      return 500;
    }
  }

  return 500;
}

/**
 * Maps controller errors to a safe client message.
 * @param error The thrown error.
 * @returns The error message.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
}
