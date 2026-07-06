'use client';

import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { Todo } from '@/core/entities/models/todo';
import type { GetTodosResponse } from '@/core/interface-adapters/controllers/todos/get-todos.controller.interface';

/**
 * Checks whether a value matches the BFF todos response shape.
 * @param value The parsed JSON body.
 * @returns True when the body contains a todos array.
 */
function isTodosResponse(value: unknown): value is GetTodosResponse {
  if (typeof value !== 'object' || value === null || !('todos' in value)) {
    return false;
  }

  const { todos } = value;

  if (!Array.isArray(todos)) {
    return false;
  }

  return todos.every(
    (todo): todo is Todo =>
      typeof todo === 'object' &&
      todo !== null &&
      'id' in todo &&
      typeof todo.id === 'string' &&
      'name' in todo &&
      typeof todo.name === 'string',
  );
}

/**
 * Client UI that loads todos from the BFF API.
 * @returns The todos page content state.
 */
export function TodosPageContent() {
  const t = useTranslations('TodosPage');
  const { isLoaded, userId } = useAuth();
  const [todos, setTodos] = useState<GetTodosResponse['todos']>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!userId) {
      setStatus('error');
      return;
    }

    const authenticatedUserId = userId;

    async function loadTodos() {
      try {
        const response = await fetch(
          `/api/todos?userId=${encodeURIComponent(authenticatedUserId)}`,
        );

        if (!response.ok) {
          throw new Error('Failed to load todos');
        }

        const body: unknown = await response.json();

        if (!isTodosResponse(body)) {
          throw new Error('Invalid todos response');
        }

        setTodos(body.todos);
        setStatus('ready');
      } catch {
        setStatus('error');
      }
    }

    void loadTodos();
  }, [isLoaded, userId]);

  if (status === 'loading') {
    return <p className="text-muted-foreground">{t('loading_message')}</p>;
  }

  if (status === 'error') {
    return <p className="text-muted-foreground">{t('error_message')}</p>;
  }

  return (
    <>
      {todos.length === 0 ? (
        <p className="text-muted-foreground">{t('empty_message')}</p>
      ) : (
        <ul aria-label={t('list_label')}>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.name}</li>
          ))}
        </ul>
      )}
    </>
  );
}
