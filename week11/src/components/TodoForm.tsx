import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

// 收输入：只持有「输入框文本」这一个局部 State，提交时把字符串向上抛。
export interface TodoFormProps {
  onAdd: (text: string) => void;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [text, setText] = useState('');

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setText(event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onAdd(text);
    setText('');
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        className="input"
        value={text}
        onChange={handleChange}
        placeholder="输入任务，回车添加"
        aria-label="新任务"
      />
      <button className="add" type="submit">
        添加
      </button>
    </form>
  );
}
