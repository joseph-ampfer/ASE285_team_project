# Calendar View Progress - AJ

## Status: Complete

## Implemented Features
- [x] Monthly calendar grid layout
- [x] Task display on due dates (using task pills)
- [x] Month navigation (Prev/Next)
- [x] View switching (List vs. Calendar)
- [x] Task detail modal

## Design Decisions
- **State-based Routing**: Decided to use React `useState` for view switching instead of `react-router-dom` to keep the project lightweight as per user request.
- **Glassmorphism Aesthetic**: Following the existing dark-themed design with semi-transparent backgrounds and vibrant gradients.
- **Date Handling**: Using native `Date` objects for calendar logic to avoid adding extra dependencies like `date-fns` or `dayjs`.

## Update: 2026-02-25
### Status: Complete - Kanban Columns & Acceptance Tests

## Implemented Features
- [x] **Kanban View**: Added three columns: "Start", "In Progress", and "Completed".
- [x] **Drag and Drop**: Implemented native HTML5 drag and drop to move tasks between columns.
- [x] **Focus Task Highlight**: Tasks in "In Progress" get a "Focus" badge (first task) and distinct styling to fulfill R3.3.
- [x] **Backend Sync**: Drag actions trigger API updates to persist the task status.
- [x] **Acceptance Tests**: Created structured test specifications for both Kanban and Calendar views in the `tests/acceptance_tests/` folder.

## Design Decisions
- **Native DnD**: Used native Drag and Drop API instead of libraries like `react-beautiful-dnd` to maintain zero-dependency frontend goals.
- **Visual Feedback**: Added `drag-over` states and animations to ensure a premium interactive feel.
- **Unified Modals**: Reused `TaskDetailModal` across all views for consistency.

## Next Steps
- Implement sorting/prioritization within columns.
- Add confirmation for deleting tasks directly from Kanban.
- Explore Vitest for automating the acceptance tests.
