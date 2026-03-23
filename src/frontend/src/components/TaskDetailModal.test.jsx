import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TaskDetailModal from './TaskDetailModal'

/*
  Mock Portal to render children directly.
*/
vi.mock('./Portal', () => ({
  default: ({ children }) => <div>{children}</div>
}))

describe('TaskDetailModal', () => {
  const mockTask = {
    _id: '1',
    title: 'Test Task',
    date: '2026-03-01',
    description: 'Test Description',
    status: 'todo',
    subtasks: [
      { id: 'a', title: 'Subtask 1', completed: false }
    ]
  }

  let onClose, onAddTask, onUpdateTask, onDeleteTask, onAddSubtask, onToggleSubtask

  beforeEach(() => {
    onClose = vi.fn()
    onAddTask = vi.fn()
    onUpdateTask = vi.fn()
    onDeleteTask = vi.fn()
    onAddSubtask = vi.fn()
    onToggleSubtask = vi.fn()

    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  // --- CREATE MODE ---

  it('renders create mode with empty fields', () => {
    render(
      <TaskDetailModal
        mode="create"
        onClose={onClose}
        onAddTask={onAddTask}
      />
    )

    expect(screen.getByText(/add task/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('calls onAddTask when saving a new task', () => {
    render(
      <TaskDetailModal
        mode="create"
        onClose={onClose}
        onAddTask={onAddTask}
      />
    )

    const [titleInput] = screen.getAllByRole('textbox')

    fireEvent.change(titleInput, {
      target: { value: 'New Task' }
    })

    const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/)

    fireEvent.change(dateInput, {
      target: { value: '2026-03-10' }
    })

    fireEvent.click(screen.getByTitle('Save'))

    expect(onAddTask).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  // --- VIEW MODE ---

  it('renders task details in view mode', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        mode="view"
        onClose={onClose}
      />
    )

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText(/test description/i)).toBeInTheDocument()
    expect(screen.getByText(/todo/i)).toBeInTheDocument()
  })

  it('does not show description if empty in view mode', () => {
    render(
      <TaskDetailModal
        task={{ ...mockTask, description: '' }}
        mode="view"
        onClose={onClose}
      />
    )

    expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
  })

  it('shows edit and delete buttons in view mode', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        mode="view"
        onClose={onClose}
      />
    )

    expect(screen.getByTitle('Edit')).toBeInTheDocument()
    expect(screen.getByTitle('Delete')).toBeInTheDocument()
  })

  // --- EDIT MODE ---

  it('switches to edit mode when edit button is clicked', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        mode="view"
        onClose={onClose}
      />
    )

    fireEvent.click(screen.getByTitle('Edit'))

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
  })

  it('calls onUpdateTask when saving edits', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        mode="edit"
        onClose={onClose}
        onUpdateTask={onUpdateTask}
      />
    )

    fireEvent.change(screen.getByDisplayValue('Test Task'), {
      target: { value: 'Updated Task' }
    })

    fireEvent.click(screen.getByTitle('Save'))

    expect(onUpdateTask).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        title: 'Updated Task'
      })
    )

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onDeleteTask when delete is confirmed', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        mode="view"
        onClose={onClose}
        onDeleteTask={onDeleteTask}
      />
    )

    fireEvent.click(screen.getByTitle('Delete'))

    expect(onDeleteTask).toHaveBeenCalledWith('1')
  })

  // --- SUBTASKS ---

  it('renders subtasks when present', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        mode="view"
        onToggleSubtask={onToggleSubtask}
      />
    )

    expect(screen.getByText('Subtask 1')).toBeInTheDocument()
  })

  it('toggles subtask when checkbox is clicked', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        mode="view"
        onToggleSubtask={onToggleSubtask}
      />
    )

    fireEvent.click(screen.getByRole('checkbox'))

    expect(onToggleSubtask).toHaveBeenCalledWith('1', 'a')
  })

  it('allows adding subtask in edit mode', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        mode="edit"
        onAddSubtask={onAddSubtask}
      />
    )

    fireEvent.change(screen.getByPlaceholderText(/add subtask/i), {
      target: { value: 'New Subtask' }
    })

    fireEvent.click(screen.getByText(/add/i))

    expect(onAddSubtask).toHaveBeenCalledWith('1', 'New Subtask')
  })

  // --- OVERLAY ---

  it('closes modal when clicking overlay', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        mode="view"
        onClose={onClose}
      />
    )

    fireEvent.click(document.querySelector('.modal-overlay'))

    expect(onClose).toHaveBeenCalled()
  })

  it('does not close when clicking inside modal', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        mode="view"
        onClose={onClose}
      />
    )

    fireEvent.click(document.querySelector('.modal-content'))

    expect(onClose).not.toHaveBeenCalled()
  })
})

