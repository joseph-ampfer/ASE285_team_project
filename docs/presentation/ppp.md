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
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
---

<!-- _class: lead -->
<!-- _backgroundColor: #2563eb -->
<!-- _color: white -->

# TaskFlow
## Team To-Do Application

**Project Plan Presentation (PPP)**

---

# Agenda

1. Team Introduction
2. Problem Domain & Motivation
3. Our Solution
4. Features Overview
5. Requirements & Tests
6. Architecture
7. Burndown Metrics
8. Q&A

---

# Meet the Team

| Member | Role | Features Assigned |
|--------|------|-------------------|
| Denver | Developer | F1: Core To-Do List, F2: Sub-Tasks + Progress |
| AJ | Developer | F3: Kanban Columns, F4: Calendar View |
| Nia | Developer | F5: Canvas API, F6: Gamification |

---

# The Problem

### Students struggle to manage academic workloads

- Students often **miss deadlines** due to poor task visibility
- Large assignments with **multiple sub-tasks** are hard to track
- No easy way to see **workload across all classes** at a glance
- **Lack of motivation** to complete tasks on time
- Existing apps are too **generic** or too **complex**

---

# Why It Matters

> Students who use task management tools effectively are **more likely to succeed academically**

### Current Solutions Fall Short:
- Generic to-do apps lack academic-specific features
- No integration with learning management systems (Canvas)
- Missing progress visualization for multi-part assignments
- No gamification to encourage task completion

---

# Our Solution: TaskFlow

A **student-oriented task manager** with:

- Sub-task progress tracking
- Kanban-style workflow management
- Calendar visualization
- Canvas LMS integration
- Gamification system

**Goal:** Help students stay organized, motivated, and succeed academically

---

<!-- _class: lead -->
<!-- _backgroundColor: #1e40af -->
<!-- _color: white -->

# Features Overview

---

# Feature 1: Core To-Do List Management
**Assigned to:** Denver

| ID | User Story |
|----|------------|
| R1.1 | As a user, I should be able to create a new task with a title and description |
| R1.2 | As a user, I should be able to edit and delete tasks |
| R1.3 | As a user, I should be able to mark tasks as complete |

### Acceptance Tests:
- Create task → verify it appears in list
- Edit/Delete task → verify changes
- Mark complete → verify status changes

---

# Feature 2: Sub-Tasks + Progress Tracking
**Assigned to:** Denver

| ID | User Story |
|----|------------|
| R2.1 | As a user, I should be able to add sub-tasks to a parent task |
| R2.2 | As a user, I should be able to mark sub-tasks as complete independently |
| R2.3 | As a user, I should be able to see a progress bar based on completed sub-tasks |

### Acceptance Tests:
- Add sub-task → verify nested display
- Complete sub-task → verify parent unchanged
- Complete 2/4 sub-tasks → verify 50% progress bar

---

# Feature 3: Kanban Columns
**Assigned to:** Developer

| ID | User Story |
|----|------------|
| R3.1 | As a user, I should be able to mark a task as "In Progress" |
| R3.2 | As a user, I should be able to drag tasks between columns |
| R3.3 | As a user, I should be able to see my current focus task at a glance |

### Columns: To-Do → In Progress → Done

---

# Feature 4: Calendar View (Read-Only)
**Assigned to:** Developer

| ID | User Story |
|----|------------|
| R4.1 | As a user, I should be able to view tasks on a calendar based on due dates |
| R4.2 | As a user, I should be able to click a calendar task to see its details |

### Acceptance Tests:
- Create task with due date Feb 15 → verify on calendar
- Click task → verify details modal appears

---

# Feature 5: Canvas API Integration
**Assigned to:** Nia

| ID | User Story |
|----|------------|
| R5.1 | As a user, I should be able to connect my Canvas LMS account |
| R5.2 | As a user, I should be able to import assignments from Canvas as tasks |
| R5.3 | As a user, I should be able to sync Canvas assignment updates automatically |

### Key Value: Automatic import of assignments with due dates!

---

# Feature 6: Points/Gamification System
**Assigned to:** Nia

| ID | User Story |
|----|------------|
| R6.1 | As a user, I should earn points when I complete tasks |
| R6.2 | As a user, I should see my total points and level on my profile |
| R6.3 | As a user, I should earn bonus points for completing tasks before the due date |

### Motivation through rewards!

---

<!-- _class: lead -->
<!-- _backgroundColor: #1e40af -->
<!-- _color: white -->

# Architecture

---

# System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│   Backend API   │────▶│    Database     │
│  (React/Vue)    │     │   (Node.js)     │     │   (MongoDB)     │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  External APIs  │
                        │   (Canvas LMS)  │
                        └─────────────────┘
```

---

# Data Model

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **User** | Application user | id, email, password_hash, points, level |
| **Task** | Individual task item | id, title, description, status, due_date, user_id |
| **SubTask** | Child task of a Task | id, title, completed, task_id |

---

# Test Strategy

### Three Levels of Testing:

1. **Unit Tests**
   - Individual function and component testing

2. **Integration Tests**
   - API endpoint and database interaction testing

3. **Acceptance Tests**
   - End-to-end user workflow testing

Each requirement has a corresponding acceptance test.

---

<!-- _class: lead -->
<!-- _backgroundColor: #059669 -->
<!-- _color: white -->

# Burndown Metrics

---

# Project Metrics Summary

| Metric | Count |
|--------|-------|
| **Features** | 6 |
| **Requirements** | 17 |
| **Tests** | 17 |

### Feature Distribution:
- Denver: 2 features (6 requirements)
- AJ: 2 features (5 requirements)
- Nia: 2 features (6 requirements)

---

# Requirements Breakdown by Feature

| Feature | Requirements | Tests |
|---------|--------------|-------|
| F1: Core To-Do List | 3 | 3 |
| F2: Sub-Tasks + Progress | 3 | 3 |
| F3: Kanban Columns | 3 | 3 |
| F4: Calendar View | 2 | 2 |
| F5: Canvas API | 3 | 3 |
| F6: Gamification | 3 | 3 |
| **Total** | **17** | **17** |

---

# Project Links

| Resource | Link |
|----------|------|
| GitHub Repository | github.com/joseph-ampfer/ASE285_team_project |
| Canvas Team Project Page | [Link TBD] |
| Canvas Progress Page | [Link TBD] |
| Documentation | docs/ |
| Source Code | src/ |
| Tests | tests/ |

---

<!-- _class: lead -->
<!-- _backgroundColor: #2563eb -->
<!-- _color: white -->

# Questions?

## Thank you!

**GitHub:** github.com/joseph-ampfer/ASE285_team_project
