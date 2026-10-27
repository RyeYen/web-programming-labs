// Prompt A 实际生成原稿；保留待审查的较弱断言，不冒称高质量范例。
import { test, expect } from 'vitest';
import { addTodo } from '../src/todo';
import type { Todo } from '../src/todo';

test('A 正常文本会增加一条任务', (): void => {
  const todos: Todo[] = [];
  addTodo(todos, '写作业');
  expect(todos).toHaveLength(1);
});

test('A 空字符串不添加', (): void => {
  const todos: Todo[] = [];
  addTodo(todos, '');
  expect(todos).toHaveLength(0);
});

test('A 纯空格不添加', (): void => {
  const todos: Todo[] = [];
  addTodo(todos, '   ');
  expect(todos).toHaveLength(0);
});
