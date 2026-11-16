
import { Modal } from 'bootstrap';

const STORAGE_KEY = 'rehaboTasks';

const PRIORITIES = [
    { key: 'high', label: 'High Priority' },
    { key: 'medium', label: 'Medium Priority' },
    { key: 'low', label: 'Low Priority' },
];

const ICONS = {
    pencil: 'M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325',
    chevron: 'M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708',
};

function iconSvg(name) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
}


let tasks = loadTasks();
const openTasks = new Set(); // ids of tasks whose details are expanded (kept across re-renders)
let editingId = null;        // null = the form is adding a new task


function loadTasks() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (err) {
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
        console.warn('Could not save tasks:', err);
    }
}


function formatRemaining(task, now) {
    if (task.done) return { text: 'Completed', overdue: false };
    if (!task.due) return { text: 'No due date', overdue: false };

    const diff = task.due - now;
    const overdue = diff < 0;
    const minutes = overdue
        ? Math.floor(-diff / 60000)
        : Math.ceil(diff / 60000);

    const d = Math.floor(minutes / 1440);
    const h = Math.floor((minutes % 1440) / 60);
    const m = minutes % 60;
    const text = `${d}d ${h}h ${m}m`;

    return { text: overdue ? `Overdue by ${text}` : `${text} left`, overdue };
}

function toInputValue(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
        + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDueDate(timestamp) {
    return new Date(timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}


function sortTasks(list) {
    return list.slice().sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        const aDue = a.due || Infinity;
        const bDue = b.due || Infinity;
        if (aDue !== bDue) return aDue - bDue;
        return a.created - b.created;
    });
}

function renderTasks() {
    const groupsEl = document.getElementById('taskGroups');
    groupsEl.innerHTML = '';

    PRIORITIES.forEach((priority) => {
        const groupTasks = sortTasks(tasks.filter((t) => t.priority === priority.key));

        const group = document.createElement('section');
        group.className = `priority-group priority-${priority.key}`;

        const heading = document.createElement('h3');
        heading.className = 'priority-heading';
        const label = document.createElement('span');
        label.textContent = priority.label;
        const count = document.createElement('span');
        count.className = 'priority-count';
        count.textContent = groupTasks.length;
        heading.append(label, count);
        group.appendChild(heading);

        if (groupTasks.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'priority-empty';
            empty.textContent = 'No tasks';
            group.appendChild(empty);
        } else {
            groupTasks.forEach((task) => group.appendChild(buildTask(task)));
        }

        groupsEl.appendChild(group);
    });

    updateTimes();
}

function buildTask(task) {
    const item = document.createElement('div');
    item.className = 'task-item' + (task.done ? ' done' : '');

    const main = document.createElement('div');
    main.className = 'task-main';

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'form-check-input task-check';
    check.checked = task.done;
    check.setAttribute('aria-label', `Mark "${task.title}" as completed`);
    check.addEventListener('change', () => {
        task.done = check.checked;
        saveTasks();
        renderTasks();
    });

    const body = document.createElement('div');
    body.className = 'task-body';

    const detailsId = `task-details-${task.id}`;
    const isOpen = openTasks.has(task.id);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'task-toggle';
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-controls', detailsId);
    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;
    const chevron = document.createElement('span');
    chevron.className = 'task-chevron';
    chevron.innerHTML = iconSvg('chevron');
    toggle.append(title, chevron);

    const details = document.createElement('div');
    details.className = 'task-details';
    details.id = detailsId;
    details.hidden = !isOpen;

    if (task.due) {
        const due = document.createElement('div');
        due.className = 'task-due';
        due.textContent = `Due: ${formatDueDate(task.due)}`;
        details.appendChild(due);
    }
    const text = document.createElement('div');
    text.className = 'task-text' + (task.details ? '' : ' empty');
    text.textContent = task.details || 'No additional details.';
    details.appendChild(text);

    toggle.addEventListener('click', () => {
        const nowOpen = details.hidden; // it is about to open
        details.hidden = !nowOpen;
        toggle.setAttribute('aria-expanded', String(nowOpen));
        if (nowOpen) openTasks.add(task.id);
        else openTasks.delete(task.id);
    });

    body.append(toggle, details);

    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'btn btn-sm btn-outline-secondary task-edit';
    edit.innerHTML = `${iconSvg('pencil')}<span>Edit</span>`;
    edit.setAttribute('aria-label', `Edit "${task.title}"`);
    edit.addEventListener('click', () => openForm(task));

    main.append(check, body, edit);

    const time = document.createElement('div');
    time.className = 'task-time';
    time.dataset.id = task.id;

    item.append(main, time);
    return item;
}

function updateTimes() {
    const now = Date.now();
    document.querySelectorAll('.task-time').forEach((el) => {
        const task = tasks.find((t) => t.id === el.dataset.id);
        if (!task) return;
        const { text, overdue } = formatRemaining(task, now);
        el.textContent = text;
        el.classList.toggle('overdue', overdue);
    });
}

const modalEl = document.getElementById('taskModal');
const modal = new Modal(modalEl);
const form = document.getElementById('taskForm');
const titleInput = document.getElementById('taskTitle');
const priorityInput = document.getElementById('taskPriority');
const detailsInput = document.getElementById('taskDetails');
const dueInput = document.getElementById('taskDue');
const deleteBtn = document.getElementById('deleteTaskBtn');
const submitBtn = document.getElementById('saveTaskBtn');
const modalTitle = document.getElementById('taskModalLabel');

function resetDeleteButton() {
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.remove('confirming');
}

function openForm(task) {
    editingId = task ? task.id : null;
    form.classList.remove('was-validated');

    titleInput.value = task ? task.title : '';
    priorityInput.value = task ? task.priority : 'medium';
    detailsInput.value = task ? task.details : '';
    dueInput.value = task ? toInputValue(task.due) : '';

    modalTitle.textContent = task ? 'Edit Task' : 'Add Task';
    submitBtn.textContent = task ? 'Save Changes' : 'Add Task';
    deleteBtn.classList.toggle('d-none', !task);
    resetDeleteButton();

    modal.show();
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    if (!title) {
        form.classList.add('was-validated');
        titleInput.focus();
        return;
    }

    const values = {
        title,
        priority: priorityInput.value,
        details: detailsInput.value.trim(),
        due: dueInput.value ? new Date(dueInput.value).getTime() : null,
    };

    if (editingId) {
        const task = tasks.find((t) => t.id === editingId);
        if (task) Object.assign(task, values);
    } else {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        tasks.push({ id, done: false, created: Date.now(), ...values });
    }

    saveTasks();
    renderTasks();
    modal.hide();
});

deleteBtn.addEventListener('click', () => {
    if (!deleteBtn.classList.contains('confirming')) {
        deleteBtn.textContent = 'Click again to confirm';
        deleteBtn.classList.add('confirming');
        return;
    }
    tasks = tasks.filter((t) => t.id !== editingId);
    openTasks.delete(editingId);
    saveTasks();
    renderTasks();
    modal.hide();
});

document.getElementById('clearDueBtn').addEventListener('click', () => {
    dueInput.value = '';
});

document.getElementById('addTaskBtn').addEventListener('click', () => openForm());

modalEl.addEventListener('shown.bs.modal', () => titleInput.focus());

renderTasks();
setInterval(updateTimes, 10000);