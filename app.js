'use strict';

const list = document.querySelector('#todo-list');
const input = document.querySelector('#todo-input');
const form = document.querySelector('#todo-form');
const summary = document.querySelector('#summary');
const KEY = 'todos';
let todos = load();

function save() {
  localStorage.setItem(KEY, JSON.stringify(todos));
}

function load() {
  const raw = localStorage.getItem(KEY);
  if (raw === null) return [];
  return JSON.parse(raw);
}

function addTodo(text) {
  text = text.trim();
  if (!text) return;
  todos = [...todos, { id: Date.now(), text, completed: false }];
  save();
  render();
}

function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function toggleTodo(id) {
  todos = todos.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t);
  save();
  render();
}

function render() {
  list.innerHTML = '';
  todos.forEach(t => {
    const li = document.createElement('li');
    li.dataset.id = t.id;
    const label = document.createElement('span');
    label.textContent = t.text;
    li.appendChild(label);
    if (t.completed) li.classList.add('done');
    li.addEventListener('click', () => toggleTodo(t.id));
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = '×';
    delBtn.setAttribute('aria-label', `删除 ${t.text}`);
    delBtn.addEventListener('click', e => {
      e.stopPropagation();
      removeTodo(t.id);
    });
    li.appendChild(delBtn);
    list.appendChild(li);
  });
  const done = todos.reduce((n, t) => n + (t.completed ? 1 : 0), 0);
  summary.textContent = `共 ${todos.length} 项，已完成 ${done} 项，未完成 ${todos.length - done} 项`;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = '';
  input.focus();
});

render();
