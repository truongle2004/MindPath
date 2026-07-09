import { UnauthenticatedError } from '@/entities/errors/unauthenticated-error';
import type { IEnsureUserUseCase } from '@/modules/user/application/use-cases/ensure-user.use-case';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';

/**
 * Resolves the internal user id from a Clerk auth context.
 * @param ensureUserUseCase The ensure-user use case.
 * @param auth The Clerk auth context.
 * @returns The internal user id.
 */
export async function resolveUserId(
  ensureUserUseCase: IEnsureUserUseCase,
  auth: AuthContext | null,
): Promise<string> {
  if (!auth?.clerkId || !auth.email) {
    throw new UnauthenticatedError('Must be logged in');
  }

  const user = await ensureUserUseCase({
    clerkId: auth.clerkId,
    email: auth.email,
    username: auth.username,
  });

  return user.id;
}
