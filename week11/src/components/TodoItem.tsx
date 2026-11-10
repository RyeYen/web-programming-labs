import type { Todo } from '../todo';

// 一行：只负责「展示 + 通知」，不持有任何状态，也不改传进来的对象。
export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className={todo.completed ? 'item done' : 'item'}>
      <label className="label">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span className="text">{todo.text}</span>
      </label>
      <button className="del" type="button" onClick={() => onDelete(todo.id)}>
        删除
      </button>
    </li>
  );
}
