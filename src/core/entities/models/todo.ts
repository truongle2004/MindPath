import * as z from 'zod';

const todoSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Todo = z.infer<typeof todoSchema>;
