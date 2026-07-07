import type { InjectionToken } from 'tsyringe';
import type { IUserRepository } from '@/modules/user/application/repositories/user.repository.interface';
import type { IEnsureUserUseCase } from '@/modules/user/application/use-cases/ensure-user.use-case';

/** User module injection tokens. */
export const Tokens = {
  UserRepository: Symbol('UserRepository') as InjectionToken<IUserRepository>,
  EnsureUserUseCase: Symbol('EnsureUserUseCase') as InjectionToken<IEnsureUserUseCase>,
};
