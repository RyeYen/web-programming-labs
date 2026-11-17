import { describe, expect, it } from 'vitest';
import type { Todo } from '../src/todo';
import type { TodoStorage } from '../src/storage';
import { STORAGE_KEY, loadTodos, parseTodos, saveTodos } from '../src/storage';

function memoryStorage(initial: string | null): TodoStorage {
  let value: string | null = initial;
  return {
    getItem: (): string | null => value,
    setItem: (_key: string, next: string): void => {
      value = next;
    },
  };
}

describe('parseTodos 的原子拒绝策略', () => {
  it('null 返回空数组', () => {
    expect(parseTodos(null)).toEqual([]);
  });

  it('非法 JSON 返回空数组', () => {
    expect(parseTodos('{not json')).toEqual([]);
  });

  it('不是数组返回空数组', () => {
    expect(parseTodos('{"a":1}')).toEqual([]);
  });

  it('任意一条记录非法，整份数据整体拒绝', () => {
    const raw = '[{"id":1,"text":"任务A","completed":false},{"id":2,"text":3}]';
    expect(parseTodos(raw)).toEqual([]);
  });

  it('重复 ID 整体拒绝', () => {
    const raw = '[{"id":1,"text":"A","completed":false},{"id":1,"text":"B","completed":true}]';
    expect(parseTodos(raw)).toEqual([]);
  });
});

describe('loadTodos / saveTodos', () => {
  it('读回合法数据', () => {
    const todos: Todo[] = [{ id: 1, text: '任务A', completed: false }];
    const storage = memoryStorage(JSON.stringify(todos));
    expect(loadTodos(storage)).toEqual(todos);
  });

  it('写回后能原样读出，且写的是同一个 key', () => {
    const storage = memoryStorage(null);
    const todos: Todo[] = [{ id: 1, text: '任务A', completed: true }];
    expect(saveTodos(storage, todos)).toBe(true);
    expect(storage.getItem(STORAGE_KEY)).toBe(JSON.stringify(todos));
  });
});
