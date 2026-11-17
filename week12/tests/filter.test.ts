import { describe, expect, it } from 'vitest';
import type { Todo } from '../src/todo';
import { filterTodos, isTodoFilter } from '../src/todo';

const todos: readonly Todo[] = [
  { id: 1, text: '任务A', completed: false },
  { id: 2, text: '任务B', completed: true },
  { id: 3, text: '任务C', completed: false },
];

describe('filterTodos', () => {
  it('all 原样返回全部', () => {
    expect(filterTodos(todos, 'all')).toHaveLength(3);
  });

  it('active 只留未完成', () => {
    expect(filterTodos(todos, 'active').map((todo) => todo.id)).toEqual([1, 3]);
  });

  it('done 只留已完成', () => {
    expect(filterTodos(todos, 'done').map((todo) => todo.id)).toEqual([2]);
  });

  it('isTodoFilter 拦住非法值', () => {
    expect(isTodoFilter('active')).toBe(true);
    expect(isTodoFilter('archived')).toBe(false);
  });
});
