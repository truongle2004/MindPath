import type { IGetTodosUseCase } from '@/core/application/use-cases/get-todos.use-case.interface';
import type {
  GetTodosResponse,
  IGetTodosController,
} from '@/core/interface-adapters/controllers/todos/get-todos.controller.interface';
import { UnauthenticatedError } from '@/core/entities/errors/auth';
import type { Todo } from '@/core/entities/models/todo';

function presenter(todos: Todo[]): GetTodosResponse {
  return {
    todos: todos.map((todo) => ({
      id: todo.id,
      name: todo.name,
    })),
  };
}

export const getTodosController =
  (getTodosUseCase: IGetTodosUseCase): IGetTodosController =>
  async (userId): Promise<GetTodosResponse> => {
    if (!userId) {
      throw new UnauthenticatedError('Must be logged in to view todos');
    }

    const todos = await getTodosUseCase();

    return presenter(todos);
  };
