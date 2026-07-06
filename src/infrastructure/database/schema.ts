import { todosSchema } from '@/core/infrastructure/todos/schema/todos';
import { counterSchema } from '@/infrastructure/database/counter';

export const databaseSchema = {
  counterSchema,
  todosSchema,
};
