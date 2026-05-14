const STORAGE_KEY = "sms_students_v1";

const form = document.getElementById("student-form");
const formHeading = document.getElementById("form-heading");
const formSubmit = document.getElementById("form-submit");
const cancelEditBtn = document.getElementById("cancel-edit");
const tbody = document.getElementById("student-list");
const searchInput = document.getElementById("student-search");

const fieldIds = ["name", "age", "roll-number", "sem", "grade"];

/** @type {{ id: string, name: string, age: number, roll: string, sem: string, grade: string }[]} */
let students = [];
let editingId = null;

function loadStudents() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(isValidStudentRecord).map(normalizeStudent);
    } catch {
        return [];
    }
}

function isValidStudentRecord(s) {
    return (
        s &&
        typeof s.id === "string" &&
        typeof s.name === "string" &&
        typeof s.roll === "string" &&
        typeof s.sem === "string" &&
        typeof s.grade === "string" &&
        typeof s.age === "number" &&
        Number.isFinite(s.age)
    );
}

function normalizeStudent(s) {
    return {
        id: s.id,
        name: String(s.name).trim(),
        age: Math.round(s.age),
        roll: String(s.roll).trim(),
        sem: String(s.sem).trim(),
        grade: String(s.grade).trim(),
    };
}

function saveStudents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function getFieldEl(id) {
    return document.getElementById(id);
}

function readForm() {
    const name = getFieldEl("name").value.trim();
    const age = Number(getFieldEl("age").value);
    const roll = getFieldEl("roll-number").value.trim();
    const sem = getFieldEl("sem").value.trim();
    const grade = getFieldEl("grade").value.trim();
    return { name, age, roll, sem, grade };
}

function fillForm(student) {
    getFieldEl("name").value = student.name;
    getFieldEl("age").value = String(student.age);
    getFieldEl("roll-number").value = student.roll;
    getFieldEl("sem").value = student.sem;
    getFieldEl("grade").value = student.grade;
}

function resetForm() {
    form.reset();
    editingId = null;
    formHeading.textContent = "Add student";
    formSubmit.textContent = "Add student";
    cancelEditBtn.hidden = true;
}

function setEditingMode(student) {
    editingId = student.id;
    fillForm(student);
    formHeading.textContent = "Edit student";
    formSubmit.textContent = "Save changes";
    cancelEditBtn.hidden = false;
    getFieldEl("name").focus();
}

function rollTaken(roll, exceptId) {
    const r = roll.trim().toLowerCase();
    return students.some(
        (s) => s.id !== exceptId && s.roll.trim().toLowerCase() === r
    );
}

function getFilteredStudents() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
        return (
            s.name.toLowerCase().includes(q) ||
            s.roll.toLowerCase().includes(q)
        );
    });
}

function renderTable() {
    const list = getFilteredStudents();
    tbody.replaceChildren();

    if (students.length === 0) {
        const tr = document.createElement("tr");
        tr.className = "placeholder-row";
        const td = document.createElement("td");
        td.colSpan = 6;
        td.textContent = "No students yet. Add one using the form above.";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    if (list.length === 0) {
        const tr = document.createElement("tr");
        tr.className = "placeholder-row";
        const td = document.createElement("td");
        td.colSpan = 6;
        td.textContent = "No students match your search.";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    for (const s of list) {
        tbody.appendChild(buildRow(s));
    }
}

function buildRow(s) {
    const tr = document.createElement("tr");
    tr.dataset.studentId = s.id;

    tr.appendChild(tdText(s.name));
    tr.appendChild(tdText(String(s.age)));
    tr.appendChild(tdText(s.roll));
    tr.appendChild(tdText(s.sem));
    tr.appendChild(tdText(s.grade));

    const actions = document.createElement("td");
    actions.className = "col-actions";

    const group = document.createElement("div");
    group.className = "action-group";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-ghost btn-sm";
    editBtn.textContent = "Edit";
    editBtn.dataset.action = "edit";
    editBtn.dataset.id = s.id;

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-danger btn-sm";
    delBtn.textContent = "Delete";
    delBtn.dataset.action = "delete";
    delBtn.dataset.id = s.id;

    group.append(editBtn, delBtn);
    actions.appendChild(group);
    tr.appendChild(actions);

    return tr;
}

function tdText(text) {
    const td = document.createElement("td");
    td.textContent = text;
    return td;
}

function newId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { name, age, roll, sem, grade } = readForm();

    if (!name || !roll || !sem || !grade || !Number.isFinite(age)) {
        alert("Please fill all fields with valid values.");
        return;
    }

    if (rollTaken(roll, editingId)) {
        alert("That roll number is already used by another student.");
        return;
    }

    if (editingId) {
        const idx = students.findIndex((s) => s.id === editingId);
        if (idx === -1) {
            resetForm();
            renderTable();
            return;
        }
        students[idx] = { id: editingId, name, age, roll, sem, grade };
        resetForm();
    } else {
        students.push({ id: newId(), name, age, roll, sem, grade });
        form.reset();
    }

    saveStudents();
    renderTable();
});

cancelEditBtn.addEventListener("click", () => {
    resetForm();
    renderTable();
});

tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn || !tbody.contains(btn)) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const student = students.find((s) => s.id === id);
    if (!student) return;

    if (action === "edit") {
        setEditingMode(student);
        return;
    }

    if (action === "delete") {
        if (!confirm(`Delete ${student.name} (${student.roll})?`)) return;
        students = students.filter((s) => s.id !== id);
        if (editingId === id) resetForm();
        saveStudents();
        renderTable();
    }
});

searchInput.addEventListener("input", () => {
    renderTable();
});

students = loadStudents();
renderTable();
