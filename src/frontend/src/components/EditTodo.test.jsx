import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import EditTodo from './EditTodo'

describe('EditTodo', () => {
  const mockTodo = {
    _id: '123',
    title: 'Original Title',
    date: '2026-03-01',
    description: 'Original Description'
  }

  let onUpdateMock
  let onCancelMock

  beforeEach(() => {
    onUpdateMock = vi.fn()
    onCancelMock = vi.fn()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with initial todo values', () => {
    render(
      <EditTodo
        todo={mockTodo}
        onUpdate={onUpdateMock}
        onCancel={onCancelMock}
      />
    )

    expect(screen.getByLabelText(/title/i).value).toBe('Original Title')
    expect(screen.getByLabelText(/due date/i).value).toBe('2026-03-01')
    expect(screen.getByLabelText(/description/i).value).toBe('Original Description')
  })

  it('calls onUpdate with trimmed title and correct arguments', () => {
    render(
      <EditTodo
        todo={mockTodo}
        onUpdate={onUpdateMock}
        onCancel={onCancelMock}
      />
    )

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: '  Updated Title  ' }
    })

    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: '2026-04-01' }
    })

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Updated Description' }
    })

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(onUpdateMock).toHaveBeenCalledWith(
      '123',
      'Updated Title',
      '2026-04-01',
      'Updated Description'
    )
  })

  it('shows alert and does not call onUpdate if required fields are missing', () => {
    render(
      <EditTodo
        todo={mockTodo}
        onUpdate={onUpdateMock}
        onCancel={onCancelMock}
      />
    )

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: '   ' }
    })

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(window.alert).toHaveBeenCalledWith(
      'Please fill in both title and date'
    )

    expect(onUpdateMock).not.toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <EditTodo
        todo={mockTodo}
        onUpdate={onUpdateMock}
        onCancel={onCancelMock}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancelMock).toHaveBeenCalledTimes(1)
  })
})

