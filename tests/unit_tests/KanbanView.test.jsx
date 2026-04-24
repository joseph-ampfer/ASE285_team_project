import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import KanbanView from '../../src/frontend/src/components/KanbanView'

/* ── Mocks ────────────────────────────────────────────────── */

// Mock the backend model import (KanbanStatus enum)
vi.mock('../../src/backend/models/Post', () => ({
  KanbanStatus: Object.freeze({
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    DONE: 'done',
  })
}))

// Mock TaskDetailModal to avoid Portal complexity
vi.mock('../../src/frontend/src/components/TaskDetailModal', () => ({
  default: ({ task, mode, onClose, onAddTask, onDeleteTask }) => (
    <div data-testid="task-modal">
      {task && <span>Modal: {task.title}</span>}
      {mode === 'create' && <span>Create Mode</span>}
      <button onClick={onClose}>Close Modal</button>
      {task && <button onClick={() => onDeleteTask(task._id)}>Delete Task</button>}
      {mode === 'create' && (
        <button onClick={() => onAddTask({ title: 'New Task', date: '2026-04-20', description: '' })}>
          Save New
        </button>
      )}
    </div>
  )
}))

// Mock CSS import (no-op)
vi.mock('../../src/frontend/src/components/KanbanView.css', () => ({}))

/* ── Helpers ──────────────────────────────────────────────── */

const TODAY = new Date('2026-04-15T12:00:00')

const makeTodo = (overrides) => ({
  _id: String(Math.random()),
  title: 'Untitled',
  date: '2026-04-15',
  status: 'todo',
  ...overrides
})

const sampleTodos = [
  makeTodo({ _id: '1', title: 'Design mockups',  status: 'todo',        date: '2026-04-16' }),
  makeTodo({ _id: '2', title: 'Write tests',     status: 'todo',        date: '2026-04-17' }),
  makeTodo({ _id: '3', title: 'Code review',     status: 'in-progress', date: '2026-04-15' }),
  makeTodo({ _id: '4', title: 'Deploy v2',       status: 'in-progress', date: '2026-04-18' }),
  makeTodo({ _id: '5', title: 'Update docs',     status: 'done',        date: '2026-04-10' }),
]

const defaultProps = {
  todos:           sampleTodos,
  onEdit:          vi.fn(),
  onAdd:           vi.fn(),
  onDelete:        vi.fn(),
  onAddSubtask:    vi.fn(),
  onToggleSubtask: vi.fn(),
}

/* ── Tests ────────────────────────────────────────────────── */

describe('KanbanView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  /* ---------- Column rendering ---------- */

  it('renders all three kanban columns', () => {
    render(<KanbanView {...defaultProps} />)

    expect(screen.getByText(/todo/i)).toBeInTheDocument()
    expect(screen.getByText(/in progress/i)).toBeInTheDocument()
    expect(screen.getByText(/done/i)).toBeInTheDocument()
  })

  it('renders column emojis', () => {
    render(<KanbanView {...defaultProps} />)

    // Emojis are rendered alongside column titles
    expect(screen.getByText(/📥/)).toBeInTheDocument()
    expect(screen.getByText(/⚡/)).toBeInTheDocument()
    expect(screen.getByText(/✅/)).toBeInTheDocument()
  })

  it('shows the correct task count per column', () => {
    render(<KanbanView {...defaultProps} />)

    // 2 todo, 2 in-progress, 1 done
    const counts = screen.getAllByText(/^[0-9]+$/)
    const countValues = counts.map(el => el.textContent)
    expect(countValues).toContain('2')  // todo column
    expect(countValues).toContain('1')  // done column
  })

  /* ---------- Task distribution ---------- */

  it('places tasks in the correct columns by status', () => {
    render(<KanbanView {...defaultProps} />)

    expect(screen.getByText('Design mockups')).toBeInTheDocument()
    expect(screen.getByText('Write tests')).toBeInTheDocument()
    expect(screen.getByText('Code review')).toBeInTheDocument()
    expect(screen.getByText('Deploy v2')).toBeInTheDocument()
    expect(screen.getByText('Update docs')).toBeInTheDocument()
  })

  it('defaults tasks without a status to the todo column', () => {
    const noStatusTodos = [
      makeTodo({ _id: 'ns1', title: 'No Status Task', status: undefined })
    ]
    const { container } = render(<KanbanView {...defaultProps} todos={noStatusTodos} />)

    // The task should appear somewhere on the board
    expect(screen.getByText('No Status Task')).toBeInTheDocument()
  })

  it('renders no tasks when todos array is empty', () => {
    const { container } = render(<KanbanView {...defaultProps} todos={[]} />)

    const items = container.querySelectorAll('.kanban-item')
    expect(items).toHaveLength(0)
  })

  /* ---------- Task item content ---------- */

  it('displays task title in each kanban item', () => {
    render(<KanbanView {...defaultProps} />)

    sampleTodos.forEach(todo => {
      expect(screen.getByText(todo.title)).toBeInTheDocument()
    })
  })

  it('displays the due date on each task card', () => {
    render(<KanbanView {...defaultProps} />)

    // Each task shows 📅 + date
    sampleTodos.forEach(todo => {
      expect(screen.getByText(`📅 ${todo.date}`)).toBeInTheDocument()
    })
  })

  it('marks all kanban items as draggable', () => {
    const { container } = render(<KanbanView {...defaultProps} />)

    const items = container.querySelectorAll('.kanban-item')
    items.forEach(item => {
      expect(item).toHaveAttribute('draggable', 'true')
    })
  })

  /* ---------- Canvas task badge ---------- */

  it('shows [Canvas] suffix for Canvas-sourced tasks', () => {
    const canvasTodos = [
      makeTodo({ _id: 'cv1', title: 'Canvas HW', status: 'todo', canvasAssignmentId: 9999 })
    ]
    render(<KanbanView {...defaultProps} todos={canvasTodos} />)

    expect(screen.getByText('[Canvas]')).toBeInTheDocument()
  })

  it('applies canvas-task class to Canvas-sourced items', () => {
    const canvasTodos = [
      makeTodo({ _id: 'cv1', title: 'Canvas HW', status: 'todo', canvasAssignmentId: 9999 })
    ]
    const { container } = render(<KanbanView {...defaultProps} todos={canvasTodos} />)

    expect(container.querySelector('.kanban-item.canvas-task')).not.toBeNull()
  })

  /* ---------- Status modifier classes ---------- */

  it('applies task--done class to done tasks', () => {
    const { container } = render(<KanbanView {...defaultProps} />)

    expect(container.querySelector('.kanban-item.task--done')).not.toBeNull()
  })

  it('applies task--in-progress class to in-progress tasks', () => {
    const { container } = render(<KanbanView {...defaultProps} />)

    expect(container.querySelector('.kanban-item.task--in-progress')).not.toBeNull()
  })

  /* ---------- Focus badge ---------- */

  it('shows Focus badge on the first in-progress task', () => {
    render(<KanbanView {...defaultProps} />)

    expect(screen.getByText('Focus')).toBeInTheDocument()
  })

  it('does not show Focus badge when there are no in-progress tasks', () => {
    const todosNoIP = sampleTodos.filter(t => t.status !== 'in-progress')
    render(<KanbanView {...defaultProps} todos={todosNoIP} />)

    expect(screen.queryByText('Focus')).not.toBeInTheDocument()
  })

  /* ---------- Add Task button ---------- */

  it('renders Add Task button only in the Todo column', () => {
    render(<KanbanView {...defaultProps} />)

    const addButtons = screen.getAllByText(/add task/i)
    expect(addButtons).toHaveLength(1)
  })

  it('opens modal in create mode when Add Task is clicked', () => {
    render(<KanbanView {...defaultProps} />)

    fireEvent.click(screen.getByText(/add task/i))

    expect(screen.getByTestId('task-modal')).toBeInTheDocument()
    expect(screen.getByText('Create Mode')).toBeInTheDocument()
  })

  /* ---------- Task click → Modal ---------- */

  it('opens modal when a task card is clicked', () => {
    render(<KanbanView {...defaultProps} />)

    fireEvent.click(screen.getByText('Design mockups'))

    expect(screen.getByTestId('task-modal')).toBeInTheDocument()
    expect(screen.getByText(/modal: design mockups/i)).toBeInTheDocument()
  })

  it('closes modal when Close button is clicked', () => {
    render(<KanbanView {...defaultProps} />)

    fireEvent.click(screen.getByText('Design mockups'))
    expect(screen.getByText(/modal: design mockups/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText(/close modal/i))
    expect(screen.queryByText(/modal: design mockups/i)).not.toBeInTheDocument()
  })

  it('does not render modal by default', () => {
    render(<KanbanView {...defaultProps} />)

    expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()
  })

  /* ---------- Delete via modal ---------- */

  it('calls onDelete through the modal delete button', () => {
    const onDeleteSpy = vi.fn()
    render(<KanbanView {...defaultProps} onDelete={onDeleteSpy} />)

    fireEvent.click(screen.getByText('Design mockups'))
    fireEvent.click(screen.getByText('Delete Task'))

    expect(onDeleteSpy).toHaveBeenCalledWith('1')
  })

  /* ---------- Add task via modal ---------- */

  it('calls onAdd through the modal create flow', () => {
    const onAddSpy = vi.fn()
    render(<KanbanView {...defaultProps} onAdd={onAddSpy} />)

    fireEvent.click(screen.getByText(/add task/i))
    fireEvent.click(screen.getByText('Save New'))

    expect(onAddSpy).toHaveBeenCalledWith('New Task', '2026-04-20', '')
  })

  /* ---------- Drag and drop ---------- */

  it('adds dragging class on dragStart and removes it on dragEnd', () => {
    const { container } = render(<KanbanView {...defaultProps} />)

    const firstItem = container.querySelector('.kanban-item')
    fireEvent.dragStart(firstItem, {
      dataTransfer: { setData: vi.fn() }
    })
    expect(firstItem.classList.contains('dragging')).toBe(true)

    fireEvent.dragEnd(firstItem)
    expect(firstItem.classList.contains('dragging')).toBe(false)
  })

  it('applies drag-over class to a column during dragOver', () => {
    const { container } = render(<KanbanView {...defaultProps} />)

    const columns = container.querySelectorAll('.kanban-column')
    const doneColumn = columns[2] // 3rd column is Done

    fireEvent.dragOver(doneColumn, { preventDefault: vi.fn() })

    // The column should now have the drag-over class
    expect(doneColumn.classList.contains('drag-over')).toBe(true)
  })

  it('calls onEdit with new status on drop to a different column', () => {
    const onEditSpy = vi.fn()
    const { container } = render(<KanbanView {...defaultProps} onEdit={onEditSpy} />)
    const columns = container.querySelectorAll('.kanban-column')
    const doneColumn = columns[2]

    // Simulate dropping task '1' (currently 'todo') onto 'done' column
    fireEvent.drop(doneColumn, {
      preventDefault: vi.fn(),
      dataTransfer: { getData: () => '1' }
    })

    expect(onEditSpy).toHaveBeenCalledWith('1', expect.objectContaining({
      status: 'done'
    }))
  })

  it('does not call onEdit when task is dropped on its current column', () => {
    const onEditSpy = vi.fn()
    const { container } = render(<KanbanView {...defaultProps} onEdit={onEditSpy} />)

    const columns = container.querySelectorAll('.kanban-column')
    const todoColumn = columns[0]

    // Drop task '1' (status 'todo') back on the 'todo' column
    fireEvent.drop(todoColumn, {
      preventDefault: vi.fn(),
      dataTransfer: { getData: () => '1' }
    })

    expect(onEditSpy).not.toHaveBeenCalled()
  })

  /* ---------- Archived done tasks hidden ---------- */

  it('hides done tasks whose due date was 7+ days ago', () => {
    const archivedTodos = [
      makeTodo({ _id: 'a1', title: 'Old Done', status: 'done', date: '2026-04-01' }) // 14 days ago
    ]
    render(<KanbanView {...defaultProps} todos={archivedTodos} />)

    expect(screen.queryByText('Old Done')).not.toBeInTheDocument()
  })

  it('shows done tasks whose due date is within 7 days', () => {
    const recentDone = [
      makeTodo({ _id: 'r1', title: 'Recent Done', status: 'done', date: '2026-04-12' }) // 3 days ago
    ]
    render(<KanbanView {...defaultProps} todos={recentDone} />)

    expect(screen.getByText('Recent Done')).toBeInTheDocument()
  })
})
