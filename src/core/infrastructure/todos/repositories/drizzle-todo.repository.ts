import type { ITodoRepository } from '@/core/application/repositories/todo.repository.interface';
import type { Todo } from '@/core/entities/models/todo';
import { todosSchema } from '@/core/infrastructure/todos/schema/todos';
import type { DbClient } from '@/utils/DBConnection';

/**
 * Creates a Drizzle-backed todo repository.
 * @param db The database client.
 * @returns A todo repository instance.
 */
export const createDrizzleTodoRepository = (db: DbClient): ITodoRepository => ({
  findAll: (): Promise<Todo[]> =>
    db
      .select({
        id: todosSchema.id,
        name: todosSchema.name,
      })
      .from(todosSchema),
});
