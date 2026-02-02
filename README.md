# TaskFlow - Team To-Do Application

A student-focused task management application designed to help students organize assignments, track progress, and collaborate on projects across multiple classes.

---

## Problem Domain and Motivation

### The Problem
Students struggle to manage assignments, deadlines, and projects across multiple classes. Existing to-do apps are either too generic or too complex, lacking features specifically designed for academic workflows like tracking progress on multi-part assignments or integrating with learning management systems.

### Why It Matters
- Students often miss deadlines due to poor task visibility
- Large assignments with multiple sub-tasks are hard to track
- No easy way to see workload across all classes at a glance
- Lack of motivation to complete tasks on time

### Our Solution
TaskFlow provides a student-oriented task manager with sub-task progress tracking, Kanban-style workflow management, calendar visualization, Canvas LMS integration, and gamification—all designed to help students stay organized, motivated, and succeed academically.

---

## Features and Requirements

### Feature 1: Core To-Do List Management
**Assigned to:** Member A

| ID | User Story | Acceptance Test |
|----|------------|-----------------|
| R1.1 | As a user, I should be able to create a new task with a title and description | Create task "Math HW" with description → verify task appears in list with correct details |
| R1.2 | As a user, I should be able to edit and delete tasks | Edit task title from "Math HW" to "Math Quiz" → verify change; Delete task → verify removal from list |
| R1.3 | As a user, I should be able to mark tasks as complete | Click complete checkbox on task → verify task status changes to completed |

---

### Feature 2: Sub-Tasks + Progress Tracking
**Assigned to:** Member A

| ID | User Story | Acceptance Test |
|----|------------|-----------------|
| R2.1 | As a user, I should be able to add sub-tasks to a parent task | Add sub-task "Problem 1" to "Math HW" → verify sub-task appears nested under parent |
| R2.2 | As a user, I should be able to mark sub-tasks as complete independently | Complete sub-task "Problem 1" → verify checkbox is checked, parent task remains incomplete |
| R2.3 | As a user, I should be able to see a progress bar based on completed sub-tasks | Complete 2 of 4 sub-tasks → verify progress bar displays 50% |

---

### Feature 3: Kanban Columns (To-Do / In Progress / Done)
**Assigned to:** Member B

| ID | User Story | Acceptance Test |
|----|------------|-----------------|
| R3.1 | As a user, I should be able to mark a task as "In Progress" | Set task status to In Progress → verify task moves to In Progress column |
| R3.2 | As a user, I should be able to drag tasks between columns | Drag task from To-Do to Done → verify task appears in Done column |
| R3.3 | As a user, I should be able to see my current focus task at a glance | Mark task as In Progress → verify it appears prominently in the In Progress column |

---

### Feature 4: Calendar View (Read-Only)
**Assigned to:** Member B

| ID | User Story | Acceptance Test |
|----|------------|-----------------|
| R4.1 | As a user, I should be able to view tasks on a calendar based on due dates | Create task with due date Feb 15 → verify task appears on Feb 15 in calendar view |
| R4.2 | As a user, I should be able to click a calendar task to see its details | Click task on calendar → verify task details modal/popup appears with full information |

---

### Feature 5: Canvas API Integration
**Assigned to:** Member C

| ID | User Story | Acceptance Test |
|----|------------|-----------------|
| R5.1 | As a user, I should be able to connect my Canvas LMS account | Enter Canvas API token → verify connection success message |
| R5.2 | As a user, I should be able to import assignments from Canvas as tasks | Click "Import from Canvas" → verify Canvas assignments appear as tasks with due dates |
| R5.3 | As a user, I should be able to sync Canvas assignment updates automatically | Update assignment in Canvas → verify task updates in TaskFlow within sync interval |

---

### Feature 6: Points/Gamification System
**Assigned to:** Member C

| ID | User Story | Acceptance Test |
|----|------------|-----------------|
| R6.1 | As a user, I should earn points when I complete tasks | Complete a task → verify points increase (e.g., +10 points) |
| R6.2 | As a user, I should see my total points and level on my profile | View profile → verify points total and current level displayed |
| R6.3 | As a user, I should earn bonus points for completing tasks before the due date | Complete task 2 days early → verify bonus points awarded |

---

## Data Model and Architecture

### System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│   Backend API   │────▶│    Database     │
│  (React/Vue)    │     │   (Node.js)     │     │  (MongoDB)   │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  External APIs  │
                        │   (Canvas LMS)  │
                        └─────────────────┘
```

### Core Data Entities

| Entity | Description | Key Fields |
|--------|-------------|------------|
| User | Application user | id, email, password_hash, points, level |
| Task | Individual task item | id, title, description, status, due_date, user_id |
| SubTask | Child task of a Task | id, title, completed, task_id |

---

## Tests

### Test Strategy
Each requirement has a corresponding acceptance test. Tests will be implemented using:
- **Unit Tests**: Individual function and component testing
- **Integration Tests**: API endpoint and database interaction testing
- **Acceptance Tests**: End-to-end user workflow testing

### Burndown Metrics

| Metric | Count |
|--------|-------|
| Features | 6 |
| Requirements | 17 |
| Tests | 17 |

---

## Team Members and Roles

| Member | Role | Features Assigned |
|--------|------|-------------------|
| Denver | Team Leader | F1: Core To-Do List, F2: Sub-Tasks + Progress |
| Developer | Developer | F3: Kanban Columns, F4: Calendar View |
| Nia | Developer | F5: Canvas API, F6: Gamification |

---

## Links

| Resource | Link |
|----------|------|
| GitHub Repository | [https://github.com/joseph-ampfer/ASE285_team_project](https://github.com/joseph-ampfer/ASE285_team_project) |
| Canvas Team Project Page | [Link TBD] |
| Canvas Progress Page | [Link TBD] |
| PPP Presentation Slides | [Link TBD] |
| Documentation | [docs/](./docs/) |
| Source Code | [src/](./src/) |
| Tests | [tests/](./tests/) |
