import type { SupabaseClient } from "@supabase/supabase-js";
import type { ITodoRepository } from "@/core/application/repositories/todo.repository.interface";
import { DatabaseOperationError } from "@/core/entities/errors/common";
import type { Todo } from "@/core/entities/models/todo";

/**
 * Checks whether a value matches the todo row shape.
 * @param value The value returned from Supabase.
 * @returns True when the value is a valid todo row.
 */
function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string"
  );
}

/**
 * Creates a Supabase-backed todo repository.
 * @param supabase The request-scoped Supabase server client.
 * @returns A todo repository instance.
 */
export const createSupabaseTodoRepository = (
  supabase: SupabaseClient,
): ITodoRepository => ({
  findAll: async () => {
    const { data, error } = await supabase.from("todos").select("id, name");

    if (error) {
      throw new DatabaseOperationError("Failed to load todos", {
        cause: error,
      });
    }

    return (data ?? []).filter(isTodo);
  },
});
