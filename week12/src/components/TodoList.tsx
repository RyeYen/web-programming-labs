import type { Todo } from '../todo';
import { useTheme } from '../theme';
import TodoItem from './TodoItem';

// 渲染列表：只读 todos，点击时把 id 抛给父组件的回调。
// 消费者 ②：中间层也消费主题（空态样式），说明它不只是「路过」。
export interface TodoListProps {
  todos: readonly Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  const { theme } = useTheme();

  if (todos.length === 0) {
    return <p className={`empty empty--${theme}`}>暂无任务</p>;
  }

  return (
    <ul className={`list list--${theme}`}>
      {todos.map((todo: Todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
