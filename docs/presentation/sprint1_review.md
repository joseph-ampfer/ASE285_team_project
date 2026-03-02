---
marp: true
theme: default
paginate: true
backgroundColor: #fff
style: |
  section {
    font-family: 'Segoe UI', Arial, sans-serif;
  }
  h1 {
    color: #2563eb;
  }
  h2 {
    color: #1e40af;
  }
  table {
    font-size: 0.8em;
  }
---

<!-- _class: lead -->
<!-- _backgroundColor: #2563eb -->
<!-- _color: white -->

# TaskFlow
## Sprint 1 Review

**Team KISS**
Joey Ampfer | AJ Schulte | Denver Hogan | Naeun Kim

---

# Agenda

1. Sprint 1 Goals
2. Sprint 1 Metrics
3. Feature Completion Status
4. Individual Contributions
5. Retrospective
6. Weekly Progress
7. Sprint 2 Plan
8. Q&A

---

# Sprint 1 Goals

### Target: Get core task management working

**Features targeted (5):**

| Feature | Description | Owner |
|---------|-------------|-------|
| F1 | Core To-Do List Management | Denver |
| F3 | Kanban Columns | AJ |
| F4 | Calendar View | AJ |
| F5 | Canvas API Integration | Naeun |
| F6 | Points / Gamification | Naeun |

**Requirements planned:** 9 of 17 total

---

# Sprint 1 Metrics

| Metric | Value |
|--------|-------|
| **Lines of Code** | ~2,200 |
| **Unit Tests** | 33 |
| **Integration Tests** | 5 |
| **Acceptance Tests** | 5 |
| **Features Completed** | 3 / 5 |
| **Requirements Completed** | 7 / 9 |
| **Feature Burndown** | 60% |
| **Requirement Burndown** | 78% |

---

# Feature Completion Status

| Feature | Requirements | Status |
|---------|-------------|--------|
| F1: Core To-Do List | R1.1, R1.2, R1.3 | **Complete** |
| F2: Sub-Tasks | *(deferred to Sprint 2)* | -- |
| F3: Kanban Columns | R3.1, R3.2, R3.3 | **Complete** |
| F4: Calendar View | R4.1, R4.2 | **Complete** |
| F5: Canvas API | R5.1 | **Not Started** |
| F6: Gamification | R6.1 | **Not Started** |

R3.2 (drag-and-drop) was completed as a **bonus** -- originally planned for Sprint 2.

---

# Individual Contributions

| Member | LoC | Features | Req. Done | Burndown |
|--------|-----|----------|-----------|----------|
| **AJ Schulte** | ~700 | F3, F4 | 4/4 (+R3.2 bonus) | 100% |
| **Denver Hogan** | ~900 | F1 | 3/3 | 100% |
| **Naeun Kim** | 0 | F5, F6 | 0/2 | 0% |
| **Joey Ampfer** | ~600 | *(Team Lead)* | -- | -- |

Joey's contributions: project scaffolding, documentation, PR management.

---

<!-- _class: lead -->
<!-- _backgroundColor: #1e40af -->
<!-- _color: white -->

# Retrospective

---

# What Went Wrong

- We couldn't make the **gamification and Canvas integration** requirements due to some recent issues that we already discussed with the professor
- **Test infrastructure** was not set up until late in the sprint, delaying test writing
- **Low velocity** in the first half of the sprint — only 2 requirements completed in ~70% of the time

---

# What Went Well

- Core features **F1, F3, and F4** were fully delivered with all planned requirements met
- **Foundation work** (updated data model with description/status/completed fields, API route extensions) was completed and unblocked feature development
- AJ **exceeded the sprint plan** by completing R3.2 (drag-and-drop between Kanban columns), originally planned for Sprint 2

---

# Analysis & Improvement Plan

- Set up **test framework and CI pipeline** at the very start of Sprint 2 instead of late in the sprint
- Schedule **weekly team check-ins** to catch blockers and availability issues earlier
- **Redistribute work** if necessary to ensure no single person is a bottleneck for entire features

---

# Weekly Progress

| Week | Accomplishments |
|------|----------------|
| **1** | Project setup — backend/frontend scaffolding, MongoDB connection, initial components, README |
| **2** | Calendar View (F4) implemented by AJ — R4.1 and R4.2 complete |
| **3** | Data model update (description, status, completed fields), Kanban Columns (F3) by AJ, frontend descriptions by Denver |
| **4** | Core To-Do List (F1) finalized by Denver, TaskDetailModal, unit + integration tests, acceptance test stubs |

---

<!-- _class: lead -->
<!-- _backgroundColor: #059669 -->
<!-- _color: white -->

# Sprint 2 Plan

---

# Sprint 2 Goals

### 3 features, 9 requirements remaining

| Feature | Requirements | Owner |
|---------|-------------|-------|
| F2: Sub-Tasks + Progress Tracking | R2.1, R2.2, R2.3 | Denver |
| F5: Canvas API Integration | R5.1, R5.2, R5.3 | Naeun |
| F6: Points / Gamification | R6.1, R6.2, R6.3 | Naeun |

Joey: coordination, testing infrastructure, documentation
AJ: maintenance/polish of F3 and F4, support testing

---

# Sprint 2 Timeline

| Week | Plan |
|------|------|
| **1** | F2 sub-task model & UI, F5 Canvas API token input, F6 points field |
| **2** | F2 progress bar, F5 Canvas assignment import, F6 profile display |
| **3** | F5 auto-sync, F6 bonus points for early completion, integration testing |
| **4** | Final integration, full test coverage, sprint review, polish |

### Key Dates
- **Team Presentation:** 3/2/26
- **Sprint 2 Review:** 3/11/26
- **Integration Milestone:** 4/1/26

---

# Changes from Initial Plan

- F5 and F6 deferred entirely from Sprint 1 to Sprint 2 due to team member availability
- AJ completed **all** F3 requirements in Sprint 1 (including R3.2), freeing capacity
- May redistribute some F5/F6 work across the team if needed

---

# Project Links

| Resource | Link |
|----------|------|
| **GitHub** | github.com/joseph-ampfer/ASE285_team_project |
| **Canvas Team Page** | nku.instructure.com/courses/87378/pages/team-project-kiss |
| **Documentation** | docs/ |
| **Source Code** | src/ |
| **Tests** | tests/ |

---

<!-- _class: lead -->
<!-- _backgroundColor: #2563eb -->
<!-- _color: white -->

# Questions?

## Thank you!

**GitHub:** github.com/joseph-ampfer/ASE285_team_project
