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
## Sprint 2 Review — Final Presentation

**Team KISS**
Joey Ampfer | AJ Schulte | Denver Hogan | Naeun Kim

---

# Agenda

1. Final Demo
2. Sprint 2 Goals
3. Sprint 2 Metrics
4. Feature Completion Status
5. Individual Contributions
6. Weekly Progress
7. Retrospective (Wrong / Well / Improvement Plan)
8. Project Links
9. Q&A

---

# Final Demo

## Live walkthrough of Sprint 2 features

**Demo video:** https://youtu.be/ZbdkTtjiGz0 

**Try it yourself:** github.com/joseph-ampfer/ASE285_team_project

Highlights:
- F2 Sub-tasks with progress bar
- F5 Canvas assignment import + auto-sync
- F6 Points & gamification
- F7 User accounts (registration + login)

---

# Sprint 2 Goals

### Target: Complete remaining features and add polish

**Features targeted (3 planned + 1 added mid-sprint):**

| Feature | Description | Owner |
|---------|-------------|-------|
| F2 | Sub-Tasks + Progress Tracking | Denver |
| F5 | Canvas API Integration | Naeun |
| F6 | Points / Gamification | Naeun |
| F7 | User Accounts (added Week 2) | Denver |

**Requirements:** 9 originally planned + 3 added (F7) = 12 total

---

# Sprint 2 Metrics

| Metric | Value |
|--------|-------|
| **Lines of Code (Sprint 2)** | ~12,800 |
| **Unit Tests added** | 118 |
| **Integration Tests added** | 18 |
| **Acceptance Tests added** | 0 |
| **Features Completed** | 4 / 4 |
| **Requirements Completed** | 12 / 12 |
| **Feature Burndown** | 100% |
| **Requirement Burndown** | 100% |

---

# Feature Completion Status

| Feature | Requirements | Status |
|---------|-------------|--------|
| F2: Sub-Tasks + Progress | R2.1, R2.2, R2.3 | **Complete** |
| F5: Canvas API | R5.1, R5.2, R5.3 | **Complete** |
| F6: Gamification | R6.1, R6.2, R6.3 | **Complete** |
| F7: User Accounts | R7.1, R7.2, R7.3 | **Complete** |

F7 (User Accounts) was added mid-sprint and still finished within Sprint 2.
AJ also delivered light/dark mode polish on top of Sprint 1's F3 and F4.

---

# Individual Contributions

| Member | LoC (S2) | Features | Req. Done | Burndown |
|--------|----------|----------|-----------|----------|
| **Denver Hogan** | ~4,636 | F2, F7 | 6/6 | 100% |
| **Naeun Kim** | ~5,380 | F5, F6 | 6/6 | 100% |
| **AJ Schulte** | ~3,368 | *(maintenance + light/dark mode)* | -- | -- |
| **Joey Ampfer** | -- | *(Team Lead)* | -- | -- |

Joey's contributions: testing infrastructure, documentation, PR management, integration support.

---

# Weekly Progress

| Week | Date | Accomplishments | Burndown |
|------|------|-----------------|----------|
| **1** | Mon Mar 23 | Sub-tasks (F2), Gamification (F6), light/dark mode | 6/9 (67%) |
| **2** | Mon Mar 30 | Canvas integration (F5); **F7 User Accounts added (+3 reqs)** | 8/12 (67%) |
| **3** | Mon Apr 6 | Canvas bug fixed (F5 complete) | 9/12 (75%) |
| **4** | Mon Apr 20 | User Accounts finished (registration + login) | 12/12 (100%) |

Denominator grew from 9 to 12 in Week 2 when User Accounts was added.

---

<!-- _class: lead -->
<!-- _backgroundColor: #1e40af -->
<!-- _color: white -->

# Retrospective

---

# What Went Wrong

- Adding **user accounts (login, signup)** after the core app was built was disruptive — required retrofitting auth into existing routes and components
- **Co-located tests vs. tests in root `tests/` dir** caused some confusion about where new tests should live
- **Canvas API integration** took longer than expected due to token handling and bug fixes spilling into Week 3

---

# What Went Well

- More **proactive this sprint** — finished features early, got to add extra polish
- Reached **100% burndown** — all 12 Sprint 2 requirements completed (9 planned + 3 added mid-sprint for User Accounts)


---

# Analysis & Improvement Plan

- **Define all requirements (including auth/accounts) before sprint start** to avoid mid-sprint scope changes
- **Standardize test file locations** at project kickoff to prevent co-location confusion
- **Begin third-party API integrations in Week 1** to leave buffer time for debugging


---

# Project Links

| Resource | Link |
|----------|------|
| **GitHub** | github.com/joseph-ampfer/ASE285_team_project |
| **Canvas Team Page** | nku.instructure.com/courses/87378/pages/team-project-kiss |
| **Canvas Progress Page** | nku.instructure.com/courses/87378/pages/team-progress-kiss |
| **Documentation** | docs/ |
| **Source Code** | src/ |
| **Tests** | tests/ + co-located in src/frontend and src/backend |

---

<!-- _class: lead -->
<!-- _backgroundColor: #2563eb -->
<!-- _color: white -->

# Questions?

## Thank you!

**GitHub:** github.com/joseph-ampfer/ASE285_team_project
