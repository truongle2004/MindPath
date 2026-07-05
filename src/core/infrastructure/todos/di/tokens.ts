import type { InjectionToken } from 'tsyringe';
import type { IGetTodosUseCase } from '@/core/application/use-cases/get-todos.use-case.interface';
import type { ITodoRepository } from '@/core/application/repositories/todo.repository.interface';
import type { IGetTodosController } from '@/core/interface-adapters/controllers/todos/get-todos.controller.interface';

/** Todo module injection tokens. */
export const Tokens = {
  TodoRepository: Symbol('TodoRepository') as InjectionToken<ITodoRepository>,
  GetTodosUseCase: Symbol('GetTodosUseCase') as InjectionToken<IGetTodosUseCase>,
  GetTodosController: Symbol('GetTodosController') as InjectionToken<IGetTodosController>,
};
