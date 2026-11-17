import { createRoot } from 'react-dom/client';
import TodoAppBuggy from './components/TodoAppBuggy';

// 只用于第 12 周「覆盖风险」的对照实验页面。
createRoot(document.getElementById('root')!).render(<TodoAppBuggy />);
