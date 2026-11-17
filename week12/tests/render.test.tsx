import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Todo } from '../src/todo';
import TodoItem from '../src/components/TodoItem';
import TodoList from '../src/components/TodoList';

const noop = (): void => undefined;

describe('子组件只由 Props 决定输出', () => {
  it('TodoList 按 props 渲染条数与文本', () => {
    const todos: Todo[] = [
      { id: 1, text: '任务A', completed: false },
      { id: 2, text: '任务B', completed: true },
    ];
    const html = renderToStaticMarkup(
      <TodoList todos={todos} onToggle={noop} onDelete={noop} />,
    );
    expect(html.match(/<li/g)).toHaveLength(2);
    expect(html).toContain('任务A');
    expect(html).toContain('任务B');
  });

  it('TodoItem 的完成态由 todo.completed 决定（done 类名 + 勾选）', () => {
    const done: Todo = { id: 1, text: '任务A', completed: true };
    const html = renderToStaticMarkup(
      <TodoItem todo={done} onToggle={noop} onDelete={noop} />,
    );
    expect(html).toContain('class="item done"');
    expect(html).toContain('checked=""');
  });

  it('空列表渲染占位文案，不渲染任何 li', () => {
    const html = renderToStaticMarkup(
      <TodoList todos={[]} onToggle={noop} onDelete={noop} />,
    );
    expect(html).toContain('暂无任务');
    expect(html).not.toContain('<li');
  });
});
