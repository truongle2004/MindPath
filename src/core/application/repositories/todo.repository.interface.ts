import type { Todo } from '@/core/entities/models/todo';

export interface ITodoRepository {
  findAll: () => Promise<Todo[]>;
}
