import { describe, expect, it } from 'vitest';
import type { Todo } from '../src/todo';
import { addTodo, deleteTodo, toggleTodo } from '../src/todo';

describe('addTodo 的输入边界', () => {
  it('纯空白不添加，原数据不变', () => {
    const before: Todo[] = [{ id: 1, text: '任务A', completed: false }];
    const after = addTodo(before, '   ');
    expect(after).toHaveLength(1);
    expect(after[0]?.text).toBe('任务A');
  });

  it('空串不添加', () => {
    expect(addTodo([], '')).toHaveLength(0);
  });

  it('非字符串入参直接忽略（不抛错）', () => {
    expect(addTodo([], 123)).toHaveLength(0);
    expect(addTodo([], null)).toHaveLength(0);
    expect(addTodo([], undefined)).toHaveLength(0);
  });

  it('首尾空格被 trim 掉', () => {
    const after = addTodo([], '  任务A  ');
    expect(after[0]?.text).toBe('任务A');
  });

  it('重复文本允许添加（业务上不算重复）', () => {
    const once = addTodo([], '任务A');
    const twice = addTodo(once, '任务A');
    expect(twice).toHaveLength(2);
  });
});

describe('切换 / 删除的非法入参', () => {
  it('切换不存在的 ID：返回等值的新数组，不抛错', () => {
    const before: Todo[] = [{ id: 1, text: '任务A', completed: false }];
    const after = toggleTodo(before, 999);
    expect(after).toEqual(before);
    expect(after).not.toBe(before);
  });

  it('删除不存在的 ID：数据不变', () => {
    const before: Todo[] = [{ id: 1, text: '任务A', completed: false }];
    expect(deleteTodo(before, 999)).toHaveLength(1);
  });

  it('非安全整数 ID 被拒绝，不崩', () => {
    const before: Todo[] = [{ id: 1, text: '任务A', completed: false }];
    expect(toggleTodo(before, Number.MAX_SAFE_INTEGER + 2)).toHaveLength(1);
    expect(deleteTodo(before, Number.NaN)).toHaveLength(1);
  });
});
