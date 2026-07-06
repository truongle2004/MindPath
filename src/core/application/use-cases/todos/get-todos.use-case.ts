import type { ITodoRepository } from '@/core/application/repositories/todo.repository.interface';
import type { IGetTodosUseCase } from '@/core/application/use-cases/get-todos.use-case.interface';
import type { Todo } from '@/core/entities/models/todo';

export const getTodosUseCase =
  (todoRepository: ITodoRepository): IGetTodosUseCase =>
  async (): Promise<Todo[]> =>
    await todoRepository.findAll();
