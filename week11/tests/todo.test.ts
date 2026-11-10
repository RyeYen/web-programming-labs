import { describe, expect, it, vi } from 'vitest';
import type { Todo } from '../src/todo';
import { addTodo, countActive, deleteTodo, toggleTodo } from '../src/todo';

function seed(): Todo[] {
  return [
    { id: 1, text: '任务A', completed: false },
    { id: 2, text: '任务B', completed: true },
  ];
}

describe('addTodo（不可变更新）', () => {
  it('追加一条，且不改动原数组', () => {
    const before = seed();
    const after = addTodo(before, '任务C');
    expect(after).toHaveLength(3);
    expect(before).toHaveLength(2);
    expect(after).not.toBe(before);
  });

  it('新记录默认未完成', () => {
    const after = addTodo([], '任务A');
    expect(after[0]?.completed).toBe(false);
  });

  it('新记录带一个安全整数的 ID', () => {
    const after = addTodo([], '任务A');
    const id = after[0]?.id ?? -1;
    expect(Number.isSafeInteger(id)).toBe(true);
    expect(id).toBeGreaterThan(0);
  });
});

describe('toggleTodo（不可变更新）', () => {
  it('翻转目标项的 completed，且不就地修改原对象', () => {
    const before = seed();
    const target = before[0] as Todo;
    const after = toggleTodo(before, 1);
    expect(after[0]?.completed).toBe(true);
    expect(target.completed).toBe(false);
    expect(after[0]).not.toBe(target);
  });

  it('只影响目标项，其他项原样返回', () => {
    const before = seed();
    const after = toggleTodo(before, 1);
    expect(after[1]).toEqual(before[1]);
    expect(after).not.toBe(before);
  });
});

describe('deleteTodo（不可变更新）', () => {
  it('删除目标项', () => {
    const after = deleteTodo(seed(), 1);
    expect(after.map((todo) => todo.id)).toEqual([2]);
  });

  it('返回新数组，原数组长度不变', () => {
    const before = seed();
    deleteTodo(before, 1);
    expect(before).toHaveLength(2);
  });
});

describe('连续更新与统计', () => {
  it('同一毫秒内连续添加两次，两条都在且 ID 不撞（函数式更新语义）', () => {
    const spy = vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    let todos: Todo[] = [];
    todos = addTodo(todos, '任务A');
    todos = addTodo(todos, '任务B');
    spy.mockRestore();
    expect(todos.map((todo) => todo.text)).toEqual(['任务A', '任务B']);
    expect(todos[0]?.id).not.toBe(todos[1]?.id);
  });

  it('countActive 只统计未完成项', () => {
    expect(countActive(seed())).toBe(1);
  });
});
