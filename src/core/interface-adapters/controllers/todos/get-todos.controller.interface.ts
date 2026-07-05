import type { Todo } from '@/core/entities/models/todo';

export type GetTodosResponse = {
  todos: Array<{
    id: Todo['id'];
    name: Todo['name'];
  }>;
};

export interface IGetTodosController {
  (userId: string | null | undefined): Promise<GetTodosResponse>;
}
