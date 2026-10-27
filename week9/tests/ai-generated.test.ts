// Prompt B 实际输出，AI 辅助参考；维度编号仅使用课件已明确的 1、2、6。
import { test, expect, vi } from 'vitest';
import { addTodo } from '../src/todo';
import type { Todo } from '../src/todo';

test('B 合法文本 trim 后添加，并保留原任务', (): void => {
  const todos: Todo[] = [{ id: 1, text: '已有任务', completed: true }];
  addTodo(todos, '  写作业  ');
  expect(todos).toHaveLength(2);
  expect(todos[0]).toEqual({ id: 1, text: '已有任务', completed: true });
  expect(todos[1]?.text).toBe('写作业');
  expect(todos[1]?.completed).toBe(false);
  expect(Number.isSafeInteger(todos[1]?.id)).toBe(true);
});

// 维度 1：null。unknown 是刻意设计的运行时输入边界，经过 typeof 收窄。
test('B null 不抛错且不改变原数组', (): void => {
  const todos: Todo[] = [{ id: 1, text: '保留', completed: false }];
  expect((): void => addTodo(todos, null)).not.toThrow();
  expect(todos).toEqual([{ id: 1, text: '保留', completed: false }]);
});

// 维度 2：纯空格，也覆盖制表符与换行。
test('B 各类空白不能添加', (): void => {
  const todos: Todo[] = [];
  addTodo(todos, ' \t\n ');
  expect(todos).toEqual([]);
});

// 维度 2：空字符串。
test('B 空字符串不能添加', (): void => {
  const todos: Todo[] = [];
  addTodo(todos, '');
  expect(todos).toEqual([]);
});

// 维度 6：连续重复文本允许添加，但 ID 不得重复。
test('B 同一毫秒连续添加重复文本，ID 仍唯一', (): void => {
  const todos: Todo[] = [];
  const clock = vi.spyOn(Date, 'now').mockReturnValue(100);
  try {
    addTodo(todos, '重复');
    addTodo(todos, '重复');
    expect(todos).toEqual([
      { id: 100, text: '重复', completed: false },
      { id: 101, text: '重复', completed: false },
    ]);
  } finally {
    clock.mockRestore();
  }
});

// 维度 2 拓展：沿用 W8 无长度上限的策略，完整保留超长文本。
test('B 一万字符合法文本完整保存', (): void => {
  const todos: Todo[] = [];
  const text: string = '长'.repeat(10000);
  addTodo(todos, text);
  expect(todos).toHaveLength(1);
  expect(todos[0]?.text).toBe(text);
  expect(todos[0]?.completed).toBe(false);
});

// 运行时异常类型防御；不为课件未明确的维度擅自编号。
test('B 非字符串输入均不污染已有数据', (): void => {
  const todos: Todo[] = [{ id: 1, text: '保留', completed: true }];
  const inputs: unknown[] = [undefined, 123, true, {}, [], { trim: (): string => '伪造' }];
  for (const value of inputs) addTodo(todos, value);
  expect(todos).toEqual([{ id: 1, text: '保留', completed: true }]);
});
