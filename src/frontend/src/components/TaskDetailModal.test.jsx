import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TaskDetailModal from './TaskDetailModal'

/*
  Mock Portal to render children directly.
*/
vi.mock('./Portal', () => ({
  default: ({ children }) => <div>{children}</div>
}))

describe('TaskDetailModal', () => {
  const mockTask = {
    title: 'Test Task',
    date: '2026-03-01',
    description: 'Test Description'
  }

  const onCloseMock = vi.fn()

  it('returns null when task is null', () => {
    const { container } = render(
      <TaskDetailModal task={null} onClose={onCloseMock} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders task details when task is provided', () => {
    render(
      <TaskDetailModal task={mockTask} onClose={onCloseMock} />
    )

    expect(screen.getByText(/task details/i)).toBeInTheDocument()
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText(/2026-03-01/i)).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('does not render description section if description is empty', () => {
    const taskWithoutDescription = {
      ...mockTask,
      description: '   '
    }

    render(
      <TaskDetailModal
        task={taskWithoutDescription}
        onClose={onCloseMock}
      />
    )

    expect(
      screen.queryByText(/description/i)
    ).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <TaskDetailModal task={mockTask} onClose={onCloseMock} />
    )

    onCloseMock.mockClear()

    fireEvent.click(screen.getByRole('button', { name: /close/i }))

    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking on overlay', () => {
    render(
      <TaskDetailModal task={mockTask} onClose={onCloseMock} />
    )

    const overlay = document.querySelector('.modal-overlay')

    onCloseMock.mockClear()

    fireEvent.click(overlay)

    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when clicking inside modal content', () => {
    render(
      <TaskDetailModal task={mockTask} onClose={onCloseMock} />
    )

    const content = document.querySelector('.modal-content')

    onCloseMock.mockClear()

    fireEvent.click(content)

    expect(onCloseMock).not.toHaveBeenCalled()
  })
})

