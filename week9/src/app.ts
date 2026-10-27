import { addTodo, deleteTodo, filterTodos, isTodoFilter, parseDatasetId, toggleTodo } from './todo';
import type { Todo, TodoFilter } from './todo';
import { loadTodos, saveTodos } from './storage';
import type { TodoStorage } from './storage';

export function mountTodoApp(
  doc: Document,
  getStorage: () => TodoStorage = (): TodoStorage => window.localStorage,
): () => void {
  const listElement: Element | null = doc.querySelector('#todo-list');
  const inputElement: Element | null = doc.querySelector('#todo-input');
  const formElement: Element | null = doc.querySelector('#todo-form');
  const summaryElement: Element | null = doc.querySelector('#summary');
  const status: Element | null = doc.querySelector('#storage-status');
  if (!(listElement instanceof HTMLUListElement) || !(inputElement instanceof HTMLInputElement) ||
      !(formElement instanceof HTMLFormElement) || !(summaryElement instanceof HTMLElement)) {
    return (): void => {};
  }
  const list: HTMLUListElement = listElement;
  const input: HTMLInputElement = inputElement;
  const form: HTMLFormElement = formElement;
  const summary: HTMLElement = summaryElement;
  const filterButtons: HTMLButtonElement[] = Array.from(doc.querySelectorAll('[data-filter]'))
    .filter((element: Element): element is HTMLButtonElement => element instanceof HTMLButtonElement);
  let storage: TodoStorage | undefined;
  try {
    storage = getStorage();
  } catch {
    if (status instanceof HTMLElement) status.textContent = '存储不可用，任务仅保留在本页。';
  }
  const todos: Todo[] = storage === undefined ? [] : loadTodos(storage);
  let filter: TodoFilter = 'all';

  function render(): void {
    list.replaceChildren();
    for (const todo of filterTodos(todos, filter)) {
      const li: HTMLLIElement = doc.createElement('li');
      li.dataset.id = String(todo.id);
      li.classList.toggle('done', todo.completed);
      const label: HTMLSpanElement = doc.createElement('span');
      label.className = 'todo-label';
      label.textContent = todo.text;
      const button: HTMLButtonElement = doc.createElement('button');
      button.type = 'button';
      button.dataset.action = 'delete';
      button.setAttribute('aria-label', `删除 ${todo.text}`);
      const icon: HTMLSpanElement = doc.createElement('span');
      icon.className = 'delete-icon';
      icon.textContent = '×';
      button.append(icon);
      li.append(label, button);
      list.append(li);
    }
    const done: number = todos.filter((todo: Todo): boolean => todo.completed).length;
    summary.textContent = `共 ${todos.length} 项，已完成 ${done} 项，未完成 ${todos.length - done} 项`;
    for (const button of filterButtons) {
      const selected: boolean = button.dataset.filter === filter;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
  }

  function persistAndRender(): void {
    const saved: boolean = storage !== undefined && saveTodos(storage, todos);
    if (status instanceof HTMLElement) {
      status.textContent = saved ? '' : '保存失败，任务仍可操作，但刷新后可能丢失。';
    }
    render();
  }

  function onListClick(event: MouseEvent): void {
    if (!(event.target instanceof Element)) return;
    const item: Element | null = event.target.closest('li');
    if (!(item instanceof HTMLLIElement) || item.parentElement !== list) return;
    const id: number | null = parseDatasetId(item.dataset.id);
    if (id === null) return;
    const button: Element | null = event.target.closest('[data-action="delete"]');
    if (button instanceof HTMLButtonElement && item.contains(button)) {
      deleteTodo(todos, id);
      persistAndRender();
      return;
    }
    toggleTodo(todos, id);
    persistAndRender();
  }

  function onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const before: number = todos.length;
    addTodo(todos, input.value);
    if (todos.length === before) return;
    persistAndRender();
    input.value = '';
    input.focus();
  }

  function onFilterClick(event: MouseEvent): void {
    if (!(event.currentTarget instanceof HTMLButtonElement)) return;
    const value: string | undefined = event.currentTarget.dataset.filter;
    if (!isTodoFilter(value)) return;
    filter = value;
    render();
  }

  list.addEventListener('click', onListClick);
  form.addEventListener('submit', onSubmit);
  for (const button of filterButtons) button.addEventListener('click', onFilterClick);
  render();
  return (): void => {
    list.removeEventListener('click', onListClick);
    form.removeEventListener('submit', onSubmit);
    for (const button of filterButtons) button.removeEventListener('click', onFilterClick);
  };
}
