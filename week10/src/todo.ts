export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export type TodoFilter = 'all' | 'done' | 'active';

// unknown is intentional: JS callers and deserialized input need runtime checks.
export function addTodo(todos: Todo[], text: unknown): void {
  if (typeof text !== 'string') return;
  const trimmed: string = text.trim();
  if (trimmed.length === 0) return;
  const used: Set<number> = new Set(todos.map((todo: Todo): number => todo.id));
  let id: number = Date.now();
  // Preserve timestamp IDs while allowing multiple additions in one millisecond.
  while (used.has(id) && Number.isSafeInteger(id)) id += 1;
  if (!Number.isSafeInteger(id)) {
    id = 0;
    while (used.has(id)) id += 1;
  }
  todos.push({ id, text: trimmed, completed: false });
}

export function toggleTodo(todos: Todo[], id: number): void {
  if (!Number.isSafeInteger(id)) return;
  const index: number = todos.findIndex((todo: Todo): boolean => todo.id === id);
  const todo: Todo | undefined = todos[index];
  if (todo !== undefined) todos[index] = { ...todo, completed: !todo.completed };
}

export function deleteTodo(todos: Todo[], id: number): void {
  if (!Number.isSafeInteger(id)) return;
  const index: number = todos.findIndex((todo: Todo): boolean => todo.id === id);
  if (index >= 0) todos.splice(index, 1);
}

export function filterTodos(todos: readonly Todo[], filter: TodoFilter): Todo[] {
  return todos.filter((todo: Todo): boolean =>
    filter === 'all' || (filter === 'done' ? todo.completed : !todo.completed));
}

export function isTodoFilter(value: unknown): value is TodoFilter {
  return value === 'all' || value === 'done' || value === 'active';
}

export function parseDatasetId(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim().length === 0) return null;
  const id: number = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}
