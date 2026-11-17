import type { Todo } from './todo';

export interface TodoStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

// Same key as Week 9/10: it is the same app, so saved todos must survive the
// React upgrade instead of silently disappearing.
export const STORAGE_KEY: string = 'week9.todos';

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isTodo(value: unknown): value is Todo {
  return typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'number' && Number.isSafeInteger(value.id) &&
    'text' in value && typeof value.text === 'string' &&
    'completed' in value && typeof value.completed === 'boolean';
}

// One record at a time: false means the whole payload must be rejected.
function collectTodo(item: unknown, ids: Set<number>, todos: Todo[]): boolean {
  // Match W8's atomic rejection policy instead of silently dropping records.
  if (!isTodo(item) || ids.has(item.id)) return false;
  ids.add(item.id);
  todos.push({ id: item.id, text: item.text, completed: item.completed });
  return true;
}

export function parseTodos(raw: string | null): Todo[] {
  if (raw === null) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!isUnknownArray(value)) return [];
    const todos: Todo[] = [];
    const ids: Set<number> = new Set();
    for (const item of value) {
      if (!collectTodo(item, ids, todos)) return [];
    }
    return todos;
  } catch {
    return [];
  }
}

export function loadTodos(storage: TodoStorage): Todo[] {
  try {
    return parseTodos(storage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveTodos(storage: TodoStorage, todos: readonly Todo[]): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(todos));
    return true;
  } catch {
    return false;
  }
}
