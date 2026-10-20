'use strict';

// W8: built on the W7 Todo V2.0 structure, with one listener on the parent UL.
const list = document.querySelector('#todo-list');
const input = document.querySelector('#todo-input');
const form = document.querySelector('#todo-form');
const summary = document.querySelector('#summary');
const KEY = 'todos';
let todos = load();
let filter = 'all';

function save() {
  localStorage.setItem(KEY, JSON.stringify(todos));
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const valid = data.every(t => t &&
      typeof t.id === 'number' && Number.isFinite(t.id) &&
      typeof t.text === 'string' && typeof t.completed === 'boolean');
    if (!valid || new Set(data.map(t => t.id)).size !== data.length) return [];
    return data;
  } catch {
    return [];
  }
}

function addTodo(text) {
  text = text.trim();
  if (!text) return;
  todos = [...todos, { id: Date.now(), text, completed: false }];
  save();
  render();
}

function deleteTodo(id) {
  console.log('[deleteTodo] id=' + id);
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function toggleTodo(id) {
  console.log('[toggleTodo] id=' + id);
  todos = todos.map(t => t.id === id ? {...t, completed: !t.completed} : t);
  save();
  render();
}

function setFilter(f) {
  if (!['all', 'done', 'active'].includes(f)) return;
  filter = f;
  render();
}

function render() {
  list.innerHTML = '';
  const shown = todos.filter(t => filter === 'all' ? true : filter === 'done' ? t.completed : !t.completed);
  shown.forEach(t => {
    const li = document.createElement('li');
    li.dataset.id = String(t.id);
    const label = document.createElement('span');
    label.className = 'todo-label';
    label.textContent = t.text;
    li.appendChild(label);
    if (t.completed) li.classList.add('done');
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.dataset.action = 'delete';
    delBtn.setAttribute('aria-label', `删除 ${t.text}`);
    const icon = document.createElement('span');
    icon.className = 'delete-icon';
    icon.textContent = '×';
    delBtn.appendChild(icon);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
  const done = todos.reduce((n, t) => n + (t.completed ? 1 : 0), 0);
  summary.textContent = `共 ${todos.length} 项，已完成 ${done} 项，未完成 ${todos.length - done} 项`;
  document.querySelectorAll('[data-filter]').forEach(button => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

// One delegated click listener survives render() because UL itself is not rebuilt.
list.addEventListener('click', e => {
  if (!(e.target instanceof Element)) return;
  const item = e.target.closest('li');
  if (!item || !list.contains(item)) return;
  const rawId = item.dataset.id;
  if (!rawId) return;
  const id = Number(rawId); // dataset is always a string, but our W7 IDs are numbers.
  if (!Number.isFinite(id)) return;
  const delBtn = e.target.closest('[data-action="delete"]');
  if (delBtn && item.contains(delBtn)) {
    deleteTodo(id);
    // Deliberately missing return: defect for Step 1 observation.
  }
  toggleTodo(id);
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = '';
  input.focus();
});

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

render();
