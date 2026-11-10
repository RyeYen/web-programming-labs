import { useEffect, useState } from 'react';
import type { Todo, TodoFilter } from '../todo';
import { addTodo, deleteTodo, filterTodos, toggleTodo, countActive, isTodoFilter } from '../todo';
import { loadTodos, saveTodos } from '../storage';
import TodoForm from './TodoForm';
import TodoList from './TodoList';

const FILTERS: readonly { value: TodoFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '未完成' },
  { value: 'done', label: '已完成' },
];

export default function TodoApp() {
  // 惰性初始化：只在首次渲染读一次 localStorage，之后全由 State 说了算。
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos(window.localStorage));
  const [filter, setFilter] = useState<TodoFilter>('all');

  // todos 一变就落盘；组件里没有任何一处手动操作 DOM。
  useEffect(() => {
    saveTodos(window.localStorage, todos);
  }, [todos]);

  // 自检钩子：控制台输入 __todos 就能拿到与页面同源的 State。
  useEffect(() => {
    window.__todos = todos;
  }, [todos]);

  function handleAdd(text: string): void {
    // 函数式更新：新值依赖旧值，永远拿队列里的最新 prev。
    setTodos((prev: Todo[]): Todo[] => addTodo(prev, text));
  }

  function handleToggle(id: number): void {
    setTodos((prev: Todo[]): Todo[] => toggleTodo(prev, id));
  }

  function handleDelete(id: number): void {
    setTodos((prev: Todo[]): Todo[] => deleteTodo(prev, id));
  }

  function handleFilter(next: TodoFilter): void {
    if (isTodoFilter(next)) setFilter(next);
  }

  const visible: Todo[] = filterTodos(todos, filter);

  return (
    <main className="app">
      <header className="head">
        <h1>Todo · V4.0</h1>
        <p className="sub">UI = f(Props, State)　React 状态驱动版</p>
      </header>

      <TodoForm onAdd={handleAdd} />

      <nav className="filters">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={item.value === filter ? 'chip on' : 'chip'}
            onClick={() => handleFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <TodoList todos={visible} onToggle={handleToggle} onDelete={handleDelete} />

      <footer className="stats">
        共 {todos.length} 项 · 未完成 {countActive(todos)} 项
      </footer>
    </main>
  );
}
