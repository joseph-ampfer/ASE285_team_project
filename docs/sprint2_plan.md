# Sprint 2 Plan — TaskFlow

**Sprint Duration:** 4 weeks (full sprint)
**Sprint Goal:** Complete all remaining features (F2, F5, F6) with full test coverage. Reach 17/17 requirements and 17/17 tests. Polish UI. Prepare final presentation.

### Key Dates

- **Sprint 1 Review Presentation:** 3/2/26
- **Sprint 2 Review Meeting:** 3/11/26
- **Integration Milestone:** 4/1/26

---

## Carry-Over from Sprint 1

Sprint 1 completed 8 of 17 requirements. Naeun was unable to contribute due to recent issues (discussed with professor), so F5 and F6 have zero progress. AJ completed R3.2 (drag-and-drop) as a bonus beyond the sprint plan, so F3 is fully done.

| Metric       | Done (from S1) | Remaining | To Complete |
|--------------|----------------|-----------|-------------|
| Requirements | 8/17           | 9         | 9           |
| Tests        | 43 written     | 9         | 9           |

### Sprint 1 Completed Requirements

| Feature | Completed Requirements | Owner |
|---------|------------------------|-------|
| F1: Core To-Do List | R1.1, R1.2, R1.3 (3/3) | Denver |
| F3: Kanban Columns | R3.1, R3.2, R3.3 (3/3) | AJ |
| F4: Calendar View | R4.1, R4.2 (2/2) | AJ |

### Remaining Requirements by Feature

| Feature | Remaining Requirements |
|---------|------------------------|
| F2: Sub-Tasks + Progress Tracking | R2.1, R2.2, R2.3 (all 3) |
| F5: Canvas API Integration | R5.1, R5.2, R5.3 (all 3) |
| F6: Gamification | R6.1, R6.2, R6.3 (all 3) |

### Remaining Tests

| Feature | Tests to Write |
|---------|----------------|
| F2: Sub-Tasks | 3 tests (R2.1, R2.2, R2.3) |
| F5: Canvas API | 3 tests (R5.1, R5.2, R5.3) |
| F6: Gamification | 3 tests (R6.1, R6.2, R6.3) |

---

## Joey Ampfer — Team Leader

Joey does not own a specific feature but supports the team across all Sprint 2 work.

| Responsibility | Details |
|----------------|---------|
| Testing infrastructure | Maintain and improve the Vitest/Supertest setup; help teammates write tests |
| Documentation | Keep README, sprint docs, and Canvas pages up to date |
| PR management | Review and merge pull requests; resolve merge conflicts |
| Integration support | Help connect F5/F6 backend work with existing frontend; assist with deployment |

---

## AJ Schulte — Maintenance & Support

F3 and F4 are fully complete from Sprint 1. AJ's Sprint 2 role is maintenance, polish, and supporting the team.

| Responsibility | Details |
|----------------|---------|
| F3/F4 bug fixes | Fix any bugs found during Sprint 2 testing in Kanban and Calendar views |
| UI polish | Improve visual consistency, responsive design, mobile experience |
| Help Naeun with F5/F6 | Pair on frontend components for Canvas integration or gamification if needed |
| Acceptance test completion | Flesh out the existing acceptance test stubs for F3 and F4 |

---

## Denver Hogan — Feature 2: Sub-Tasks + Progress Tracking

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

## Naeun Kim — Features 5 & 6 (Full)

Neither F5 nor F6 was started in Sprint 1. All 6 requirements (R5.1–R5.3, R6.1–R6.3) need to be completed in Sprint 2.

### Week 1: Canvas Account Connection (R5.1)

| Task | Details |
|------|---------|
| Backend: token storage | Create endpoint to accept and store a Canvas API token securely |
| Frontend: token input UI | Build a settings/connection page with a text field for the Canvas API token |
| Connection verification | Hit the Canvas API (`GET /api/v1/users/self`) with the token to verify it works |
| Acceptance criteria | Enter Canvas API token — verify connection success message |

### Week 1: Earn Points on Task Completion (R6.1)

| Task | Details |
|------|---------|
| Add `points` field to data model | Add a `points` field (Number, default 0) to the user or a global state document |
| Increment on completion | When a task's status changes to `done`, award +10 points |
| Acceptance criteria | Complete a task — verify points increase by 10 |

### Week 2: Canvas Assignment Import (R5.2)

| Task | Details |
|------|---------|
| Backend: Canvas API client | Fetch assignments from Canvas API using stored token (`GET /api/v1/courses/:id/assignments`) |
| Import route | `POST /api/canvas/import` — fetch assignments, create Task records with title + due date |
| Frontend: Import button | "Import from Canvas" button that triggers the import and shows results |
| Acceptance criteria | Click "Import from Canvas" — verify Canvas assignments appear as tasks with due dates |

### Week 2: Points Display on Profile (R6.2)

| Task | Details |
|------|---------|
| Profile/dashboard view | Create a simple profile section showing total points and current level |
| Level calculation | Define level thresholds (e.g., 0–50 pts = Level 1, 51–150 = Level 2, etc.) |
| Acceptance criteria | View profile — verify points total and current level are displayed |

### Week 3: Canvas Auto-Sync (R5.3)

| Task | Details |
|------|---------|
| Sync mechanism | Backend periodic check (e.g., on login or manual refresh) or polling interval |
| Update existing tasks | If a Canvas assignment's due date or title changes, update the corresponding task |
| Acceptance criteria | Update assignment in Canvas — verify task updates in TaskFlow within sync interval |

### Week 3: Bonus Points for Early Completion (R6.3)

| Task | Details |
|------|---------|
| Early completion detection | Compare task completion date to due date |
| Bonus calculation | Award bonus points based on how early the task was completed (e.g., +5 pts per day early) |
| Acceptance criteria | Complete task 2 days early — verify bonus points awarded |

### Week 3–4: Write All F5 & F6 Tests

| Test | Requirement | Acceptance Criteria |
|------|-------------|---------------------|
| Test R5.1 | Connect Canvas account | Enter token — verify connection success message |
| Test R5.2 | Import Canvas assignments | Click import — verify assignments appear as tasks with due dates |
| Test R5.3 | Auto-sync Canvas updates | Update Canvas assignment — verify task updates in TaskFlow |
| Test R6.1 | Earn points on completion | Complete task — verify +10 points |
| Test R6.2 | Points and level display | View profile — verify points total and level shown |
| Test R6.3 | Bonus points for early completion | Complete task 2 days early — verify bonus points |

### Week 4: Polish and Bug Fixes

- Handle Canvas API errors gracefully (invalid token, rate limits, network failures)
- Points history or activity log (stretch goal)
- Gamification UI polish (badges, animations)

**Sprint 2 Target for Naeun:** F5 fully complete (3/3 requirements + 3/3 tests), F6 fully complete (3/3 requirements + 3/3 tests)

---

## Sprint 2 Weekly Summary

| Week | Denver (F2) | Naeun (F5 & F6) | AJ (Support) | Joey (Lead) |
|------|-------------|------------------|--------------|-------------|
| 1 | R2.1: SubTask model + CRUD | R5.1: Canvas connection; R6.1: Points on completion | UI polish, help with F5/F6 frontend | Testing infra, PR reviews |
| 2 | R2.2 + R2.3: Sub-task completion + progress bar | R5.2: Canvas import; R6.2: Profile points display | Acceptance tests for F3/F4, bug fixes | Documentation, integration support |
| 3 | Write F2 tests; bug fixes | R5.3: Canvas sync; R6.3: Bonus points; write tests | Help with F5/F6 integration | PR reviews, Canvas page updates |
| 4 | Final testing, presentation prep | Final testing, polish, presentation prep | Final testing, presentation prep | Final testing, presentation prep |

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
| Naeun has 6 requirements in one sprint | High workload; risk of incomplete F5/F6 again | AJ and Joey available to help; prioritize R5.1 and R6.1 in Week 1 so later work can build on them |
| Canvas API complexity or rate limits | R5.2 and R5.3 may be harder than expected | Build mock Canvas responses for testing; decouple import logic from API calls |
| Sub-task data model design | Cascading deletes, progress calculation edge cases | Design the schema carefully in Week 1; write tests for edge cases |
| Team communication gaps | Blockers go unnoticed, repeated Sprint 1 issues | Weekly check-ins every Monday; async updates in team chat |
