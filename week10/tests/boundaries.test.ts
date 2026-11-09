import { test, expect } from 'vitest';
import { addTodo, deleteTodo, filterTodos, parseDatasetId, toggleTodo } from '../src/todo';
import type { Todo } from '../src/todo';
import { loadTodos, parseTodos, saveTodos, STORAGE_KEY } from '../src/storage';
import type { TodoStorage } from '../src/storage';

test('dataset 拦截缺失、空白、尾随字符、小数、不安全整数', (): void => {
  const inputs: (string | undefined)[] = [undefined, '', '   ', '123abc', '1.5', '9007199254740992', 'NaN', 'Infinity'];
  for (const raw of inputs) expect(parseDatasetId(raw)).toBe(null);
});

test('dataset 允许安全整数与数值 0', (): void => {
  expect(parseDatasetId('123')).toBe(123);
  expect(parseDatasetId('0')).toBe(0);
  expect(parseDatasetId(' 42 ')).toBe(42);
});

test('存储可恢复合法旧数据，包括安全负数 ID', (): void => {
  const todos: Todo[] = [{ id: -1, text: '旧任务', completed: true }];
  expect(parseTodos(JSON.stringify(todos))).toEqual(todos);
});

test('无存储、非法 JSON 或非数组均降级为空', (): void => {
  const inputs: (string | null)[] = [null, '', '{', 'null', '{}', '123', '"text"'];
  for (const raw of inputs) expect(parseTodos(raw)).toEqual([]);
});

test('逐属性验证类型，部分损坏时原子拒绝整组数据', (): void => {
  const invalid: unknown[] = [null, {}, { id: '1', text: 'x', completed: false },
    { id: 1, text: 123, completed: false }, { id: 1, text: 'x', completed: 'false' },
    { id: 1.5, text: 'x', completed: false }, { id: 9007199254740992, text: 'x', completed: false }];
  for (const item of invalid) {
    expect(parseTodos(JSON.stringify([{ id: 2, text: '完整', completed: false }, item]))).toEqual([]);
  }
});

test('重复 ID 不进入内存，避免误删误切换', (): void => {
  expect(parseTodos('[{"id":1,"text":"a","completed":false},{"id":1,"text":"b","completed":true}]')).toEqual([]);
});

test('读写异常被捕获，保存失败以 false 报告', (): void => {
  const storage: TodoStorage = {
    getItem: (): string | null => { throw new Error('denied'); },
    setItem: (): void => { throw new Error('quota'); },
  };
  expect(loadTodos(storage)).toEqual([]);
  expect(saveTodos(storage, [{ id: 1, text: '内存任务', completed: false }])).toBe(false);
});

test('load/save 往返且仅使用 week9.todos', (): void => {
  const data: Map<string, string> = new Map([['todos', 'Week 8 原值']]);
  const storage: TodoStorage = {
    getItem: (key: string): string | null => data.get(key) ?? null,
    setItem: (key: string, value: string): void => { data.set(key, value); },
  };
  const todos: Todo[] = [{ id: 1, text: '保存', completed: true }];
  expect(saveTodos(storage, todos)).toBe(true);
  expect(data.get(STORAGE_KEY)).toBe(JSON.stringify(todos));
  expect(loadTodos(storage)).toEqual(todos);
  expect(data.get('todos')).toBe('Week 8 原值');
});

test('删除指定项，找不到 ID 时数据不变', (): void => {
  const todos: Todo[] = [{ id: 1, text: 'a', completed: false }, { id: 2, text: 'b', completed: true }];
  deleteTodo(todos, 999);
  expect(todos).toHaveLength(2);
  deleteTodo(todos, 1);
  expect(todos).toEqual([{ id: 2, text: 'b', completed: true }]);
});

test('非法数值 ID 不能切换或删除', (): void => {
  const todos: Todo[] = [{ id: 1, text: 'a', completed: false }];
  for (const id of [NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    toggleTodo(todos, id);
    deleteTodo(todos, id);
  }
  expect(todos).toEqual([{ id: 1, text: 'a', completed: false }]);
});

test('三种筛选只选择目标状态且不改变源数组', (): void => {
  const todos: Todo[] = [{ id: 1, text: 'a', completed: false }, { id: 2, text: 'b', completed: true }];
  expect(filterTodos(todos, 'all')).toEqual(todos);
  expect(filterTodos(todos, 'done')).toEqual([{ id: 2, text: 'b', completed: true }]);
  expect(filterTodos(todos, 'active')).toEqual([{ id: 1, text: 'a', completed: false }]);
  expect(todos).toEqual([{ id: 1, text: 'a', completed: false }, { id: 2, text: 'b', completed: true }]);
});

test('添加不会改写已有对象，HTML 文本保持原样', (): void => {
  const todos: Todo[] = [{ id: 1, text: 'a', completed: true }];
  addTodo(todos, '<img src=x onerror=alert(1)>');
  expect(todos[0]).toEqual({ id: 1, text: 'a', completed: true });
  expect(todos[1]?.text).toBe('<img src=x onerror=alert(1)>');
});
