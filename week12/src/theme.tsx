import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY: string = 'week12.theme';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// 默认值只在「找不到 Provider」时生效：它是兜底，不是初始状态。
export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: (): void => undefined,
});

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

// 读取也走防护：非法值、读不到、抛异常，一律退回 light。
export function readStoredTheme(storage: Storage | undefined): Theme {
  try {
    const saved: string | null = storage?.getItem(THEME_STORAGE_KEY) ?? null;
    return isTheme(saved) ? saved : 'light';
  } catch {
    return 'light';
  }
}

export interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // 惰性初始化：只在首次挂载读一次 localStorage。
  const [theme, setTheme] = useState<Theme>(() =>
    readStoredTheme(typeof window === 'undefined' ? undefined : window.localStorage));

  // 写入只留一个 Effect，依赖写全；value 用 useMemo 固定引用，
  // 否则每次渲染都是新对象，所有消费者都会重渲染。
  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // 隐私模式 / 配额满：写不进去不影响页面切换。
    }
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// 自定义 Hook：把 useContext 包一层，组件不必关心 Context 变量名。
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
