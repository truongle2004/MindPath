import { counterSchema } from '@/infrastructure/database/counter';
import { todosSchema } from '@/core/infrastructure/todos/schema/todos';

export const databaseSchema = {
  counterSchema,
  todosSchema,
};

export type DatabaseSchema = typeof databaseSchema;
