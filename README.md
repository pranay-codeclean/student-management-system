# Student Management System

A small **browser-based** app to **add, edit, delete, and search** student records. Built with plain **HTML, CSS, and JavaScript** (no frameworks). Data is saved in the browser using **`localStorage`**, so the list survives page refreshes on the same device and browser profile.

## What it is for

It gives you **one place** to keep a roster with consistent fields (name, age, roll number, semester, grade), **find students quickly** by name or roll, and **update or remove** entries—useful as a **demo**, **learning project**, or **personal checklist** on a single machine.

It is **not** a multi-user school ERP: there is no server, login, or shared database.

## Features

- Add a student with validation (HTML `required`, number range for age).
- View all students in a responsive table.
- **Edit** a student (with **Cancel** to leave edit mode).
- **Delete** with a confirmation prompt.
- **Search** by name or roll (case-insensitive).
- **Duplicate roll numbers** are blocked for different students (rolls are compared case-insensitively).
- **Persistence** via `localStorage` under the key `sms_students_v1`.

## Tech stack

- HTML5 (semantic sections, form labels, table structure)
- CSS3 (layout, responsive table scroll, component-style classes)
- Vanilla JavaScript (DOM APIs, events, `JSON` + `localStorage`)

## How to run

### Option A: Open the file

Double-click **`index.html`** or open it from your editor’s “Open in browser” action. This is enough for normal use in most browsers.

### Option B: Local static server (optional)

If your browser or environment behaves oddly with `file://`, serve the folder:

```bash
cd student-management-system
python3 -m http.server 8080
```

Then visit `http://localhost:8080` in the browser.

(Any static file server works the same way.)

## Project structure

| File        | Role                                              |
|------------|---------------------------------------------------|
| `index.html` | Page structure: form + student table + search   |
| `style.css`  | Layout, typography, table and button styles     |
| `script.js`  | CRUD logic, search filter, `localStorage` I/O   |

## Data model

Each student is a JSON object stored inside an array:

| Field   | Type   | Notes                                      |
|---------|--------|--------------------------------------------|
| `id`    | string | Stable unique id (e.g. `crypto.randomUUID`) |
| `name`  | string | Trimmed                                    |
| `age`   | number | Integer                                    |
| `roll`  | string | Unique among students (case-insensitive)   |
| `sem`   | string | Semester label                             |
| `grade` | string | Grade or score label                       |

## Limitations and future work

- Data stays **in this browser only**; clearing site data or another device will not see the same list.
- No **export/import** (CSV/JSON), **sortable columns**, or **backend API** yet—reasonable next steps if you want to grow the project.
- A production system would use a **real database** (e.g. PostgreSQL or SQLite) behind an API, plus **authentication** and **authorization**.

## License

This project is provided as-is for portfolio and learning use. Add a license file if you plan to open-source it formally.
