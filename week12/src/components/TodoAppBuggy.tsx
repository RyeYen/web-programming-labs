import { useEffect, useState } from 'react';
import type { Todo } from '../todo';

// 对照实验专用：把「读一个 Effect + 写一个 Effect」的写法原样跑一遍，
// 看首次加载时写入的是哪个 todos。只用于验证，不参与正式页面。
export default function TodoAppBuggy() {
  const [todos, setTodos] = useState<Todo[]>([]); // 首次渲染一定是空数组

  useEffect(() => {
    const saved = localStorage.getItem('week9.todos');
    if (saved) setTodos(JSON.parse(saved)); // 读：没有 try-catch、没有 Array.isArray
  }, []);

  useEffect(() => {
    localStorage.setItem('week9.todos', JSON.stringify(todos)); // 写：首次提交就跑，写的是 []
  }, [todos]);

  return (
    <ul>
      {todos.map((todo: Todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
