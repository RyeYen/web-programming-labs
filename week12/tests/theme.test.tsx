import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Todo } from '../src/todo';
import TodoItem from '../src/components/TodoItem';
import { ThemeContext, readStoredTheme } from '../src/theme';
import type { ThemeContextValue } from '../src/theme';

const noop = (): void => undefined;
const todo: Todo = { id: 1, text: '任务A', completed: false };

function context(theme: 'light' | 'dark'): ThemeContextValue {
  return { theme, setTheme: noop };
}

describe('readStoredTheme 的兜底策略', () => {
  it('没有存储时退回 light', () => {
    expect(readStoredTheme(undefined)).toBe('light');
  });

  it('存的是 dark 时读回 dark', () => {
    const storage = { getItem: (): string => 'dark' } as unknown as Storage;
    expect(readStoredTheme(storage)).toBe('dark');
  });

  it('非法值不当作主题，退回 light', () => {
    const storage = { getItem: (): string => 'blue' } as unknown as Storage;
    expect(readStoredTheme(storage)).toBe('light');
  });

  it('getItem 抛异常时退回 light，不冒泡', () => {
    const storage = {
      getItem: (): string => {
        throw new Error('SecurityError');
      },
    } as unknown as Storage;
    expect(readStoredTheme(storage)).toBe('light');
  });
});

describe('消费者从 Context 取值，而不是从 Props 传', () => {
  it('Provider 给 dark，TodoItem 的 data-theme 就是 dark', () => {
    const html = renderToStaticMarkup(
      <ThemeContext.Provider value={context('dark')}>
        <TodoItem todo={todo} onToggle={noop} onDelete={noop} />
      </ThemeContext.Provider>,
    );
    expect(html).toContain('data-theme="dark"');
  });

  it('找不到 Provider 时用默认值 light，不报错', () => {
    const html = renderToStaticMarkup(
      <TodoItem todo={todo} onToggle={noop} onDelete={noop} />,
    );
    expect(html).toContain('data-theme="light"');
  });
});
