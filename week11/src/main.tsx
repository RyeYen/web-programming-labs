import { createRoot } from 'react-dom/client';
import TodoApp from './components/TodoApp';
import './styles.css';

// 非空断言 !：告诉 TypeScript 这个元素一定存在（index.html 里写死了 #root）。
const root = document.getElementById('root')!;

createRoot(root).render(<TodoApp />);
