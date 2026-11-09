// AI 辅助参考：这五项由 AI 生成，学生需要理解后独立重写。
import { test, expect } from 'vitest';
import { addTodo, toggleTodo } from '../src/todo';
import type { Todo } from '../src/todo';

test('正常添加：长度增加且文本等于输入', (): void => {
  const todos: Todo[] = [];
  addTodo(todos, '学习 TypeScript');
  expect(todos).toHaveLength(1);
  expect(todos[0]?.text).toBe('学习 TypeScript');
  expect(todos[0]?.completed).toBe(false);
});

test('纯空格不能添加，已有数据不变', (): void => {
  const todos: Todo[] = [{ id: 1, text: '原任务', completed: false }];
  addTodo(todos, '   ');
  expect(todos).toEqual([{ id: 1, text: '原任务', completed: false }]);
});

test('空字符串不能添加', (): void => {
  const todos: Todo[] = [];
  addTodo(todos, '');
  expect(todos).toEqual([]);
});

test('正常切换仅翻转指定任务，两次切换可恢复', (): void => {
  const todos: Todo[] = [
    { id: 1, text: '第一项', completed: false },
    { id: 2, text: '第二项', completed: true },
  ];
  toggleTodo(todos, 1);
  expect(todos).toEqual([
    { id: 1, text: '第一项', completed: true },
    { id: 2, text: '第二项', completed: true },
  ]);
  toggleTodo(todos, 1);
  expect(todos[0]?.completed).toBe(false);
});

test('不存在的 ID 不抛错且全部数据不变', (): void => {
  const todos: Todo[] = [{ id: 1, text: '原任务', completed: false }];
  expect((): void => toggleTodo(todos, 999)).not.toThrow();
  expect(todos).toEqual([{ id: 1, text: '原任务', completed: false }]);
});
