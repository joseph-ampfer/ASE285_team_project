import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import AddTodo from './AddTodo'

describe('AddTodo', () => {
  let onAddMock

  beforeEach(() => {
    onAddMock = vi.fn()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all form fields', () => {
    render(<AddTodo onAdd={onAddMock} />)

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument()
  })

  it('shows alert and does not call onAdd if required fields are missing', () => {
    render(<AddTodo onAdd={onAddMock} />)

    fireEvent.click(screen.getByRole('button', { name: /add todo/i }))

    expect(window.alert).toHaveBeenCalledWith('Please fill in both title and date')
    expect(onAddMock).not.toHaveBeenCalled()
  })

  it('calls onAdd with trimmed values when form is valid', () => {
    render(<AddTodo onAdd={onAddMock} />)

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: '  My Task  ' }
    })

    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: '2026-03-01' }
    })

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: '  Some details  ' }
    })

    fireEvent.click(screen.getByRole('button', { name: /add todo/i }))

    expect(onAddMock).toHaveBeenCalledWith(
      'My Task',
      '2026-03-01',
      'Some details'
    )
  })

  it('clears inputs after successful submission', () => {
    render(<AddTodo onAdd={onAddMock} />)

    const titleInput = screen.getByLabelText(/title/i)
    const dateInput = screen.getByLabelText(/due date/i)
    const descriptionInput = screen.getByLabelText(/description/i)

    fireEvent.change(titleInput, {
      target: { value: 'Task' }
    })

    fireEvent.change(dateInput, {
      target: { value: '2026-03-01' }
    })

    fireEvent.change(descriptionInput, {
      target: { value: 'Details' }
    })

    fireEvent.click(screen.getByRole('button', { name: /add todo/i }))

    expect(titleInput.value).toBe('')
    expect(dateInput.value).toBe('')
    expect(descriptionInput.value).toBe('')
  })
})

