import type { Todo } from './todo';

declare global {
  interface Window {
    // 自检用：把当前 State 暴露到控制台，方便对照「页面呈现」与「todos 数据」。
    __todos?: readonly Todo[];
  }
}

export {};
