import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import CalendarView from '../../src/frontend/src/components/CalendarView'

/* ── Mocks ────────────────────────────────────────────────── */

// Mock TaskDetailModal so we avoid Portal / DOM complexity
vi.mock('../../src/frontend/src/components/TaskDetailModal', () => ({
  default: ({ task, onClose }) => (
    <div data-testid="task-modal">
      <span>Modal: {task.title}</span>
      <button onClick={onClose}>Close Modal</button>
    </div>
  )
}))

// Mock CSS imports (no-op)
vi.mock('../../src/frontend/src/components/CalendarView.css', () => ({}))

/* ── Helpers ──────────────────────────────────────────────── */

const TODAY = new Date('2026-04-15T12:00:00')

const baseTodos = [
  { _id: '1', title: 'Team Standup', date: '2026-04-15' },
  { _id: '2', title: 'Sprint Review', date: '2026-04-15' },
  { _id: '3', title: 'Dentist', date: '2026-04-20' },
]

const defaultProps = {
  todos: baseTodos,
  onUpdateTask: vi.fn(),
  onDeleteTask: vi.fn(),
  onAddSubtask: vi.fn(),
  onToggleSubtask: vi.fn(),
}

/* ── Tests ────────────────────────────────────────────────── */

describe('CalendarView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  /* ---------- Rendering ---------- */

  it('renders the current month and year in the header', () => {
    render(<CalendarView {...defaultProps} />)

    expect(screen.getByText(/april 2026/i)).toBeInTheDocument()
  })

  it('renders all 7 weekday labels', () => {
    render(<CalendarView {...defaultProps} />)

    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    labels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('renders exactly 42 day cells (6-week grid)', () => {
    const { container } = render(<CalendarView {...defaultProps} />)

    const cells = container.querySelectorAll('.calendar-day-cell')
    expect(cells).toHaveLength(42)
  })

  it('marks days outside the current month with the other-month class', () => {
    const { container } = render(<CalendarView {...defaultProps} todos={[]} />)

    const otherMonthCells = container.querySelectorAll('.calendar-day-cell.other-month')
    expect(otherMonthCells.length).toBeGreaterThan(0)
  })

  it('highlights today\'s date with the today class', () => {
    const { container } = render(<CalendarView {...defaultProps} todos={[]} />)

    const todayCells = container.querySelectorAll('.calendar-day-cell.today')
    expect(todayCells).toHaveLength(1)
  })

  /* ---------- Task display ---------- */

  it('displays tasks on their correct dates', () => {
    render(<CalendarView {...defaultProps} />)

    expect(screen.getByText('Team Standup')).toBeInTheDocument()
    expect(screen.getByText('Sprint Review')).toBeInTheDocument()
    expect(screen.getByText('Dentist')).toBeInTheDocument()
  })

  it('renders multiple tasks on the same date', () => {
    render(<CalendarView {...defaultProps} />)

    // Both tasks are on 2026-04-15
    expect(screen.getByText('Team Standup')).toBeInTheDocument()
    expect(screen.getByText('Sprint Review')).toBeInTheDocument()
  })

  it('renders no task pills when no todos are provided', () => {
    const { container } = render(<CalendarView {...defaultProps} todos={[]} />)

    const pills = container.querySelectorAll('.task-pill')
    expect(pills).toHaveLength(0)
  })

  it('truncates long task titles with ellipsis', () => {
    const longTodos = [
      { _id: 'long1', title: 'This Is A Very Long Title That Exceeds Limit', date: '2026-04-15' }
    ]
    render(<CalendarView {...defaultProps} todos={longTodos} />)

    // The truncateCalendarTitle function caps at 14 chars + "···"
    expect(screen.getByText('This Is A Very···')).toBeInTheDocument()
  })

  it('does not truncate short task titles', () => {
    const shortTodos = [
      { _id: 'short1', title: 'Brief', date: '2026-04-15' }
    ]
    render(<CalendarView {...defaultProps} todos={shortTodos} />)

    expect(screen.getByText('Brief')).toBeInTheDocument()
  })

  /* ---------- Canvas task badge ---------- */

  it('shows [Canvas] suffix for Canvas-sourced tasks', () => {
    const canvasTodos = [
      { _id: 'c1', title: 'HW 1', date: '2026-04-15', canvasAssignmentId: 12345 }
    ]
    render(<CalendarView {...defaultProps} todos={canvasTodos} />)

    expect(screen.getByText('[Canvas]')).toBeInTheDocument()
  })

  it('applies canvas-task class to Canvas tasks', () => {
    const canvasTodos = [
      { _id: 'c1', title: 'HW 1', date: '2026-04-15', canvasAssignmentId: 12345 }
    ]
    const { container } = render(<CalendarView {...defaultProps} todos={canvasTodos} />)

    const canvasPill = container.querySelector('.task-pill.canvas-task')
    expect(canvasPill).not.toBeNull()
  })

  /* ---------- Status modifier classes ---------- */

  it('applies task--done class for done tasks', () => {
    const doneTodos = [
      { _id: 'd1', title: 'Finished', date: '2026-04-15', status: 'done' }
    ]
    const { container } = render(<CalendarView {...defaultProps} todos={doneTodos} />)

    const pill = container.querySelector('.task-pill.task--done')
    expect(pill).not.toBeNull()
  })

  it('applies task--in-progress class for in-progress tasks', () => {
    const ipTodos = [
      { _id: 'ip1', title: 'Working', date: '2026-04-15', status: 'in-progress' }
    ]
    const { container } = render(<CalendarView {...defaultProps} todos={ipTodos} />)

    const pill = container.querySelector('.task-pill.task--in-progress')
    expect(pill).not.toBeNull()
  })

  /* ---------- Navigation ---------- */

  it('navigates to the next month when → is clicked', () => {
    render(<CalendarView {...defaultProps} todos={[]} />)

    fireEvent.click(screen.getByText('→'))

    expect(screen.getByText(/may 2026/i)).toBeInTheDocument()
  })

  it('navigates to the previous month when ← is clicked', () => {
    render(<CalendarView {...defaultProps} todos={[]} />)

    fireEvent.click(screen.getByText('←'))

    expect(screen.getByText(/march 2026/i)).toBeInTheDocument()
  })

  it('returns to the current month when Today is clicked', () => {
    render(<CalendarView {...defaultProps} todos={[]} />)

    // Navigate away
    fireEvent.click(screen.getByText('→'))
    fireEvent.click(screen.getByText('→'))
    expect(screen.getByText(/june 2026/i)).toBeInTheDocument()

    // Click Today
    fireEvent.click(screen.getByText(/today/i))

    expect(screen.getByText(/april 2026/i)).toBeInTheDocument()
  })

  it('can navigate multiple months forward and back', () => {
    render(<CalendarView {...defaultProps} todos={[]} />)

    // 3 months forward
    fireEvent.click(screen.getByText('→'))
    fireEvent.click(screen.getByText('→'))
    fireEvent.click(screen.getByText('→'))
    expect(screen.getByText(/july 2026/i)).toBeInTheDocument()

    // 3 months back
    fireEvent.click(screen.getByText('←'))
    fireEvent.click(screen.getByText('←'))
    fireEvent.click(screen.getByText('←'))
    expect(screen.getByText(/april 2026/i)).toBeInTheDocument()
  })

  /* ---------- Modal interaction ---------- */

  it('opens the task detail modal when a task pill is clicked', () => {
    render(<CalendarView {...defaultProps} />)

    fireEvent.click(screen.getByText('Dentist'))

    expect(screen.getByTestId('task-modal')).toBeInTheDocument()
    expect(screen.getByText(/modal: dentist/i)).toBeInTheDocument()
  })

  it('closes the modal when the close button is clicked', () => {
    render(<CalendarView {...defaultProps} />)

    fireEvent.click(screen.getByText('Dentist'))
    expect(screen.getByText(/modal: dentist/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText(/close modal/i))
    expect(screen.queryByText(/modal: dentist/i)).not.toBeInTheDocument()
  })

  it('does not render the modal when no task is selected', () => {
    render(<CalendarView {...defaultProps} />)

    expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()
  })

  /* ---------- Edge cases ---------- */

  it('handles tasks with no matching date (not visible in grid)', () => {
    const futureTodos = [
      { _id: 'f1', title: 'Far Away Task', date: '2030-12-25' }
    ]
    const { container } = render(<CalendarView {...defaultProps} todos={futureTodos} />)

    // The task won't appear on the current month grid
    const pills = container.querySelectorAll('.task-pill')
    expect(pills).toHaveLength(0)
  })

  it('sets task title as the title attribute on task pills', () => {
    render(<CalendarView {...defaultProps} />)

    const pill = screen.getByText('Dentist')
    expect(pill).toHaveAttribute('title', 'Dentist')
  })
})
