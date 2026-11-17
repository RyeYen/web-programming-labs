import { createRoot } from 'react-dom/client';
import TodoApp from './components/TodoApp';
import { ThemeProvider } from './theme';
import './styles.css';

// 非空断言 !：告诉 TypeScript 这个元素一定存在（index.html 里写死了 #root）。
const root = document.getElementById('root')!;

// Provider 只包一次：TodoItem / TodoList / ThemeToggle 就近取值，中间层不用转发。
createRoot(root).render(
  <ThemeProvider>
    <TodoApp />
  </ThemeProvider>,
);
