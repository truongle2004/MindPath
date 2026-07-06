import type { Todo } from '@/core/entities/models/todo';

export type ITodoRepository = {
  findAll: () => Promise<Todo[]>;
};
