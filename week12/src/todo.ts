// Week 11 · V4.0：业务逻辑全部改成「返回新数组」的纯函数。
// 改动点：函数不再原地 push / splice / 赋值，而是返回一份新引用，
// 让 React 的 Object.is 比对能看出「State 变了」。
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export type TodoFilter = 'all' | 'done' | 'active';

// unknown is intentional: JS callers and deserialized input need runtime checks.
export function addTodo(todos: readonly Todo[], text: unknown): Todo[] {
  if (typeof text !== 'string') return [...todos];
  const trimmed: string = text.trim();
  if (trimmed.length === 0) return [...todos];
  const used: Set<number> = new Set(todos.map((todo: Todo): number => todo.id));
  let id: number = Date.now();
  // Preserve timestamp IDs while allowing multiple additions in one millisecond.
  while (used.has(id) && Number.isSafeInteger(id)) id += 1;
  if (!Number.isSafeInteger(id)) {
    id = 0;
    while (used.has(id)) id += 1;
  }
  return [...todos, { id, text: trimmed, completed: false }];
}

export function toggleTodo(todos: readonly Todo[], id: number): Todo[] {
  if (!Number.isSafeInteger(id)) return [...todos];
  return todos.map((todo: Todo): Todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo);
}

export function deleteTodo(todos: readonly Todo[], id: number): Todo[] {
  if (!Number.isSafeInteger(id)) return [...todos];
  return todos.filter((todo: Todo): boolean => todo.id !== id);
}

export function filterTodos(todos: readonly Todo[], filter: TodoFilter): Todo[] {
  return todos.filter((todo: Todo): boolean =>
    filter === 'all' || (filter === 'done' ? todo.completed : !todo.completed));
}

export function countActive(todos: readonly Todo[]): number {
  return todos.reduce((sum: number, todo: Todo): number => (todo.completed ? sum : sum + 1), 0);
}

export function isTodoFilter(value: unknown): value is TodoFilter {
  return value === 'all' || value === 'done' || value === 'active';
}

export function parseDatasetId(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim().length === 0) return null;
  const id: number = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}
