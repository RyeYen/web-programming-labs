// @vitest-environment jsdom
import { test, expect } from 'vitest';
import { mountTodoApp } from '../src/app';
import { STORAGE_KEY } from '../src/storage';
import type { TodoStorage } from '../src/storage';

function setup(): { data: Map<string, string>; cleanup: () => void } {
  document.body.innerHTML = '<form id="todo-form"><input id="todo-input"></form>' +
    '<button data-filter="all"></button><button data-filter="done"></button><button data-filter="active"></button>' +
    '<p id="summary"></p><p id="storage-status"></p><ul id="todo-list"></ul>';
  const data: Map<string, string> = new Map();
  data.set(STORAGE_KEY, '[{"id":1,"text":"a","completed":false},{"id":2,"text":"b","completed":false}]');
  const storage: TodoStorage = {
    getItem: (key: string): string | null => data.get(key) ?? null,
    setItem: (key: string, value: string): void => { data.set(key, value); },
  };
  return { data, cleanup: mountTodoApp(document, (): TodoStorage => storage) };
}

function click(selector: string): void {
  const element: Element | null = document.querySelector(selector);
  if (!(element instanceof HTMLElement)) throw new Error(`Missing ${selector}`);
  element.click();
}

test('委托支持子图标删除，删除后不会误切换其他项', (): void => {
  const { data, cleanup } = setup();
  try {
    click('li[data-id="1"] .delete-icon');
    expect(document.querySelectorAll('li')).toHaveLength(1);
    expect(document.querySelector('li')?.textContent).toBe('b×');
    expect(data.get(STORAGE_KEY)).toBe('[{"id":2,"text":"b","completed":false}]');
    click('.todo-label');
    expect(document.querySelector('li')?.classList.contains('done')).toBe(true);
  } finally { cleanup(); }
});

test('脏 dataset 和非 Element 事件目标均被拦截', (): void => {
  const { data, cleanup } = setup();
  try {
    const item: Element | null = document.querySelector('li');
    if (!(item instanceof HTMLLIElement)) throw new Error('Missing li');
    const original: string | undefined = data.get(STORAGE_KEY);
    for (const id of ['123abc', '1.5', '', '   ', '9007199254740992']) {
      item.dataset.id = id;
      click('.todo-label');
      expect(data.get(STORAGE_KEY)).toBe(original);
    }
    delete item.dataset.id;
    click('.todo-label');
    const text: Text = document.createTextNode('text target');
    item.append(text);
    text.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(data.get(STORAGE_KEY)).toBe(original);
  } finally { cleanup(); }
});

test('添加、筛选、重挂载恢复数据且文本不会作为 HTML 执行', (): void => {
  const { data, cleanup } = setup();
  try {
    const input: Element | null = document.querySelector('#todo-input');
    const form: Element | null = document.querySelector('#todo-form');
    if (!(input instanceof HTMLInputElement) || !(form instanceof HTMLFormElement)) throw new Error('Missing form');
    input.value = '<img src=x onerror=alert(1)>';
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelectorAll('li')).toHaveLength(3);
    expect(document.querySelector('li img')).toBe(null);
    expect(document.querySelectorAll('.todo-label')[2]?.textContent).toBe('<img src=x onerror=alert(1)>');
    click('li[data-id="1"] .todo-label');
    click('[data-filter="done"]');
    expect(document.querySelectorAll('li')).toHaveLength(1);
    expect(document.querySelector('.todo-label')?.textContent).toBe('a');
    click('[data-filter="active"]');
    expect(document.querySelectorAll('li')).toHaveLength(2);
    cleanup();
    const dispose: () => void = mountTodoApp(document, (): TodoStorage => ({
      getItem: (key: string): string | null => data.get(key) ?? null,
      setItem: (key: string, value: string): void => { data.set(key, value); },
    }));
    try {
      expect(document.querySelectorAll('li')).toHaveLength(3);
      expect(document.querySelector('#summary')?.textContent).toBe('共 3 项，已完成 1 项，未完成 2 项');
    } finally { dispose(); }
  } finally { cleanup(); }
});

test('存储获取异常仍可操作，缺少 DOM 时安全退出', (): void => {
  const first = setup();
  first.cleanup();
  const cleanup: () => void = mountTodoApp(document, (): TodoStorage => { throw new Error('denied'); });
  try {
    expect(document.querySelectorAll('li')).toHaveLength(0);
    expect(document.querySelector('#storage-status')?.textContent).toContain('存储不可用');
  } finally { cleanup(); }
  document.body.replaceChildren();
  expect((): void => { mountTodoApp(document); }).not.toThrow();
});
