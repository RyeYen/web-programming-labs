import { useTheme } from '../theme';
import type { Theme } from '../theme';

// 消费者 ③：按钮本身不持有主题，只读 Context 并发出切换请求。
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next: Theme = theme === 'light' ? 'dark' : 'light';

  return (
    <button className="toggle" type="button" onClick={() => setTheme(next)}>
      {theme === 'light' ? '🌙 切到 dark' : '☀️ 切到 light'}
      <span className="sr-only">（当前 {theme}，点击切到 {next}）</span>
    </button>
  );
}
