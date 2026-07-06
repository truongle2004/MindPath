import type { Todo } from '@/core/entities/models/todo';

export type GetTodosResponse = {
  todos: {
    id: Todo['id'];
    name: Todo['name'];
  }[];
};

export type IGetTodosController = (userId: string | null | undefined) => Promise<GetTodosResponse>;
