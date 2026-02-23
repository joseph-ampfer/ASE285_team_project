# Sprint 2 Plan — TaskFlow

**Sprint Duration:** 4 weeks (full sprint)
**Sprint Goal:** Complete all remaining requirements and tests (17/17 each). Polish UI. Prepare final presentation.

---

## Carry-Over from Sprint 1

Assuming Sprint 1 targets are met, the following work remains at the start of Sprint 2:

| Metric       | Done (from S1) | Remaining | To Complete |
|--------------|----------------|-----------|-------------|
| Requirements | 9/17           | 8         | 8           |
| Tests        | 9/17           | 8         | 8           |

### Remaining Requirements by Feature

| Feature | Remaining Requirements |
|---------|------------------------|
| F2: Sub-Tasks + Progress Tracking | R2.1, R2.2, R2.3 (all 3) |
| F3: Kanban Columns | R3.2 (drag-and-drop) |
| F5: Canvas API Integration | R5.2, R5.3 |
| F6: Gamification | R6.2, R6.3 |

### Remaining Tests

| Feature | Tests to Write |
|---------|----------------|
| F2: Sub-Tasks | 3 tests (R2.1, R2.2, R2.3) |
| F3: Kanban Columns | 3 tests (R3.1, R3.2, R3.3) |
| F5: Canvas API | 2 tests (R5.2, R5.3) |
| F6: Gamification | 2 tests (R6.2, R6.3) |

---

## AJ — Feature 3: Kanban Columns (Remaining)

Sprint 1 delivered R3.1 (mark as In Progress) and R3.3 (focus task at a glance). Sprint 2 completes the feature.

### Week 1–2: Drag-and-Drop (R3.2)

| Task | Details |
|------|---------|
| Install drag-and-drop library | Add `@hello-pangea/dnd` (or `dnd-kit`) to frontend dependencies |
| Create KanbanBoard component | Three-column layout: To-Do, In Progress, Done |
| Implement drag between columns | Dragging a task from one column to another updates its `status` field via the API |
| Acceptance criteria | Drag task from To-Do to Done — verify task appears in Done column and persists on reload |

### Week 2: Write All F3 Tests

| Test | Requirement | Acceptance Criteria |
|------|-------------|---------------------|
| Test R3.1 | Mark task as In Progress | Set task status to In Progress — verify task moves to In Progress column |
| Test R3.2 | Drag tasks between columns | Drag task from To-Do to Done — verify task appears in Done column |
| Test R3.3 | Focus task at a glance | Mark task as In Progress — verify it appears prominently in the In Progress column |

### Week 3–4: Polish and Bug Fixes

- Ensure drag-and-drop works on mobile / touch devices
- Visual polish for Kanban columns (consistent card sizes, column headers)
- Fix any bugs found during testing

**Sprint 2 Target for AJ:** F3 fully complete (3/3 requirements + 3/3 tests)

---

## Denver — Feature 2: Sub-Tasks + Progress Tracking (Full)

This is a brand-new feature for Sprint 2. No Sprint 1 carry-over.

### Week 1: Sub-Task Model and CRUD (R2.1)

| Task | Details |
|------|---------|
| Create SubTask schema | Fields: `_id`, `title` (String), `completed` (Boolean, default false), `task_id` (reference to parent Task) |
| Add API routes | `POST /api/posts/:id/subtasks` — create sub-task; `GET /api/posts/:id/subtasks` — list sub-tasks; `PUT /api/subtasks/:id` — update; `DELETE /api/subtasks/:id` — delete |
| Frontend: sub-task list under parent | Render sub-tasks nested under the parent task in TodoItem; add form to create sub-tasks |
| Acceptance criteria | Add sub-task "Problem 1" to "Math HW" — verify sub-task appears nested under parent |

### Week 1–2: Independent Sub-Task Completion (R2.2)

| Task | Details |
|------|---------|
| Add checkbox to each sub-task | Toggling it sets `completed: true` via API |
| Parent task stays incomplete | Completing a sub-task does not automatically complete the parent |
| Acceptance criteria | Complete sub-task "Problem 1" — verify checkbox is checked, parent task remains incomplete |

### Week 2: Progress Bar (R2.3)

| Task | Details |
|------|---------|
| Calculate progress | `completedSubtasks / totalSubtasks * 100` |
| Render progress bar | Show a visual progress bar on the parent task (CSS or a lightweight component) |
| Acceptance criteria | Complete 2 of 4 sub-tasks — verify progress bar displays 50% |

### Week 3: Write All F2 Tests

| Test | Requirement | Acceptance Criteria |
|------|-------------|---------------------|
| Test R2.1 | Add sub-tasks to parent | Add sub-task "Problem 1" to "Math HW" — verify it appears nested under parent |
| Test R2.2 | Mark sub-tasks complete independently | Complete sub-task — verify checkbox checked, parent remains incomplete |
| Test R2.3 | Progress bar accuracy | Complete 2 of 4 sub-tasks — verify progress bar shows 50% |

### Week 3–4: Bug Fixes and Polish

- Handle edge cases: deleting a parent task should delete its sub-tasks
- Progress bar animation / styling
- Test with large numbers of sub-tasks

**Sprint 2 Target for Denver:** F2 fully complete (3/3 requirements + 3/3 tests)

---

## Naeun — Features 5 & 6 (Remaining)

Sprint 1 delivered R5.1 (Canvas connection) and R6.1 (earn points on completion). Sprint 2 completes both features.

### Week 1: Canvas Assignment Import (R5.2)

| Task | Details |
|------|---------|
| Backend: Canvas API client | Fetch assignments from Canvas API using stored token (`GET /api/v1/courses/:id/assignments`) |
| Import route | `POST /api/canvas/import` — fetch assignments, create Task records with title + due date |
| Frontend: Import button | "Import from Canvas" button that triggers the import and shows results |
| Acceptance criteria | Click "Import from Canvas" — verify Canvas assignments appear as tasks with due dates |

### Week 1–2: Canvas Auto-Sync (R5.3)

| Task | Details |
|------|---------|
| Sync mechanism | Backend periodic check (e.g., on login or manual refresh) or polling interval |
| Update existing tasks | If a Canvas assignment's due date or title changes, update the corresponding task |
| Acceptance criteria | Update assignment in Canvas — verify task updates in TaskFlow within sync interval |

### Week 2: Points Display on Profile (R6.2)

| Task | Details |
|------|---------|
| Profile/dashboard view | Create a simple profile section showing total points and current level |
| Level calculation | Define level thresholds (e.g., 0–50 pts = Level 1, 51–150 = Level 2, etc.) |
| Acceptance criteria | View profile — verify points total and current level are displayed |

### Week 2–3: Bonus Points for Early Completion (R6.3)

| Task | Details |
|------|---------|
| Early completion detection | Compare task completion date to due date |
| Bonus calculation | Award bonus points based on how early the task was completed (e.g., +5 pts per day early) |
| Acceptance criteria | Complete task 2 days early — verify bonus points awarded |

### Week 3: Write Remaining Tests

| Test | Requirement | Acceptance Criteria |
|------|-------------|---------------------|
| Test R5.2 | Import Canvas assignments | Click import — verify assignments appear as tasks with due dates |
| Test R5.3 | Auto-sync Canvas updates | Update Canvas assignment — verify task updates in TaskFlow |
| Test R6.2 | Points and level display | View profile — verify points total and level shown |
| Test R6.3 | Bonus points for early completion | Complete task 2 days early — verify bonus points |

### Week 3–4: Polish and Bug Fixes

- Handle Canvas API errors gracefully (invalid token, rate limits, network failures)
- Points history or activity log (stretch goal)
- Gamification UI polish (badges, animations)

**Sprint 2 Target for Naeun:** F5 fully complete (3/3 requirements + 2 remaining tests), F6 fully complete (3/3 requirements + 2 remaining tests)

---

## Sprint 2 Weekly Summary

| Week | AJ (F3) | Denver (F2) | Naeun (F5 & F6) |
|------|---------|-------------|------------------|
| 1 | R3.2: Drag-and-drop implementation | R2.1: SubTask model + CRUD | R5.2: Canvas import |
| 2 | R3.2: Finish drag-and-drop; write F3 tests | R2.2 + R2.3: Sub-task completion + progress bar | R5.3: Canvas sync; R6.2: Profile points display |
| 3 | UI polish, bug fixes | Write F2 tests; bug fixes | R6.3: Bonus points; write remaining tests |
| 4 | Final testing, presentation prep | Final testing, presentation prep | Final testing, presentation prep |

---

## Sprint 2 Burndown Target (End of Sprint)

| Metric       | Done  | Remaining | % Complete |
|--------------|-------|-----------|------------|
| Requirements | 17/17 | 0         | 100%       |
| Tests        | 17/17 | 0         | 100%       |

### Final Feature Completion

| Feature | Requirements | Tests | Owner |
|---------|-------------|-------|-------|
| F1: Core To-Do List | 3/3 | 3/3 | Denver |
| F2: Sub-Tasks + Progress | 3/3 | 3/3 | Denver |
| F3: Kanban Columns | 3/3 | 3/3 | AJ |
| F4: Calendar View | 2/2 | 2/2 | AJ |
| F5: Canvas API | 3/3 | 3/3 | Naeun |
| F6: Gamification | 3/3 | 3/3 | Naeun |
| **Total** | **17/17** | **17/17** | |

---

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Sprint 1 targets not fully met | Carry-over increases Sprint 2 workload | Prioritize unfinished S1 work in Week 1 of S2 |
| Canvas API changes or rate limits | R5.2 and R5.3 may be harder than expected | Build mock Canvas responses for testing; decouple import logic from API calls |
| Drag-and-drop complexity | R3.2 is the most technically complex requirement | Use a well-documented library (`@hello-pangea/dnd`); start early in Week 1 |
| Sub-task data model design | Cascading deletes, progress calculation edge cases | Design the schema carefully in Week 1; write tests for edge cases |
