import type { Todo } from "@/core/entities/models/todo";

export interface IGetTodosUseCase {
  (): Promise<Todo[]>;
}
