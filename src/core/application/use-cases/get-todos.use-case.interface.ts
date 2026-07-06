import type { Todo } from '@/core/entities/models/todo';

export type IGetTodosUseCase = () => Promise<Todo[]>;
