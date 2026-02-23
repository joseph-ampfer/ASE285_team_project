# Sprint 1 Plan — TaskFlow

**Sprint Duration:** 4 weeks
**Time Remaining:** ~30% (~8–9 days)
**Sprint Goal:** Get core task management fully working with a proper data model, deliver Feature 1 and Feature 4 as complete features (requirements + tests), and make meaningful progress on Features 3 and 6.

---

## Current Progress

| Metric       | Completed | Total | % Done |
|--------------|-----------|-------|--------|
| Requirements | 2         | 17    | 12%    |
| Tests        | 0         | 17    | 0%     |

**Completed so far:**
- R4.1 — View tasks on a calendar based on due dates (AJ)
- R4.2 — Click a calendar task to see its details (AJ)

---

## Foundation Work (Shared — First Priority)

These changes unblock Feature 1, Feature 3, and Feature 6. Someone (Denver or AJ) should tackle these immediately.

### 1. Update Task Data Model

File: `src/backend/models/Post.js`

The current schema only has `_id`, `title`, and `date`. Add:

| Field         | Type    | Default  | Purpose                          |
|---------------|---------|----------|----------------------------------|
| `description` | String  | `""`     | Task description (F1: R1.1)      |
| `status`      | String  | `"todo"` | Kanban column (F1, F3: R3.1)     |
| `completed`   | Boolean | `false`  | Completion tracking (F1: R1.3)   |

`status` should be an enum restricted to: `"todo"`, `"in-progress"`, `"done"`.

### 2. Update API Routes

File: `src/backend/routes/api.js`

- Accept `description`, `status`, and `completed` in POST and PUT request bodies.
- Return the new fields in all responses.

### 3. Set Up Test Framework

- **Backend:** Install Jest (or Vitest) and Supertest. Configure the `test` script in `src/backend/package.json`.
- **Frontend:** Install Vitest and React Testing Library. Configure the `test` script in `src/frontend/package.json`.
- Create a `tests/` directory at the project root (or colocate tests near source files).

---

## AJ — Features 3 & 4

### Feature 4: Calendar View (Complete Requirements, Add Tests)

F4 requirements are implemented. Remaining work is tests only.

| Task | Requirement | Est. Days | Status |
|------|-------------|-----------|--------|
| Write acceptance test: create task with due date Feb 15, verify it appears on Feb 15 in calendar view | R4.1 | 1 | Not started |
| Write acceptance test: click task on calendar, verify detail modal appears with full info | R4.2 | 1 | Not started |

### Feature 3: Kanban Columns (Partial — Start)

| Task | Requirement | Est. Days | Status |
|------|-------------|-----------|--------|
| Add status field support to UI; implement ability to mark a task as "In Progress" | R3.1 | 3 | Not started |
| Ensure In Progress tasks appear prominently (focus task at a glance) | R3.3 | 2 | Not started |

**Sprint 1 Target for AJ:**
- F4 fully complete: 2 requirements + 2 tests
- F3 partially done: R3.1 and R3.3 requirements implemented

---

## Denver — Features 1 & 2

### Feature 1: Core To-Do List Management (Full)

The existing scaffolding (AddTodo, EditTodo, TodoItem, TodoList) provides a starting point but does not satisfy the requirements as-is. The data model must be extended first (see Foundation Work above).

| Task | Requirement | Est. Days | Status |
|------|-------------|-----------|--------|
| Add description field to create and edit forms; verify task appears in list with correct title + description | R1.1 | 2 | Not started |
| Verify edit (title, description, date) and delete work correctly with updated model | R1.2 | 1 | Not started |
| Add completion checkbox to TodoItem; toggling it marks the task as completed | R1.3 | 1 | Not started |
| Write 3 acceptance tests for R1.1, R1.2, R1.3 | R1.1–R1.3 | 2 | Not started |

**Sprint 1 Target for Denver:**
- F1 fully complete: 3 requirements + 3 tests

---

## Naeun — Features 5 & 6

### Feature 6: Points / Gamification (Start)

| Task | Requirement | Est. Days | Status |
|------|-------------|-----------|--------|
| Add `points` field to user/task model; increment points when a task is completed (+10 pts) | R6.1 | 3 | Not started |
| Write acceptance test for R6.1 | R6.1 | 1 | Not started |

### Feature 5: Canvas API Integration (Start)

| Task | Requirement | Est. Days | Status |
|------|-------------|-----------|--------|
| Build Canvas API token input UI and backend token storage; show connection success message | R5.1 | 3 | Not started |
| Write acceptance test for R5.1 | R5.1 | 1 | Not started |

**Sprint 1 Target for Naeun:**
- R6.1 + R5.1 done with tests: 2 requirements + 2 tests

---

## Sprint 1 Burndown Target (End of Sprint)

| Metric       | Done | Remaining | % Complete |
|--------------|------|-----------|------------|
| Requirements | 9/17 | 8         | 53%        |
| Tests        | 9/17 | 8         | 53%        |

### Requirements Breakdown at Sprint End

| Feature | Requirements Done | Requirements Remaining |
|---------|-------------------|------------------------|
| F1: Core To-Do List | R1.1, R1.2, R1.3 (3/3) | 0 |
| F2: Sub-Tasks | — (0/3) | R2.1, R2.2, R2.3 |
| F3: Kanban Columns | R3.1, R3.3 (2/3) | R3.2 |
| F4: Calendar View | R4.1, R4.2 (2/2) | 0 |
| F5: Canvas API | R5.1 (1/3) | R5.2, R5.3 |
| F6: Gamification | R6.1 (1/3) | R6.2, R6.3 |

---

## Risks

1. **Data model change breaks existing features.** The schema update touches every existing component. Run the app after changes and verify calendar view and list view still work.
2. **No test infrastructure yet.** Setting up the test framework is a prerequisite for everyone writing tests. Do this first.
3. **Team velocity is low.** The team completed 2 requirements in 70% of Sprint 1. The remaining plan requires 7 more requirements + 9 tests in 30% of the time. Prioritize requirements over polish.
