import type { Todo } from '@/core/entities/models/todo';
import type { IGetTodosUseCase } from '@/core/application/use-cases/get-todos.use-case.interface';
import type { ITodoRepository } from '@/core/application/repositories/todo.repository.interface';

export const getTodosUseCase =
  (todoRepository: ITodoRepository): IGetTodosUseCase =>
  (): Promise<Todo[]> =>
    todoRepository.findAll();
