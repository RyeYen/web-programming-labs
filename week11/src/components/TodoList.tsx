import type { Todo } from '../todo';
import TodoItem from './TodoItem';

// 渲染列表：只读 todos，点击时把 id 抛给父组件的回调。
export interface TodoListProps {
  todos: readonly Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="empty">暂无任务</p>;
  }

  return (
    <ul className="list">
      {todos.map((todo: Todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
