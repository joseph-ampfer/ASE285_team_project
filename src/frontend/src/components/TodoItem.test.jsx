import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import TodoItem from './TodoItem'

describe('TodoItem', () => {
  const mockTodo = {
    _id: 'abc123',
    title: 'Test Task',
    date: '2026-03-01'
  }

  let onEditMock
  let onDeleteMock
  let onSelectMock

  beforeEach(() => {
    onEditMock = vi.fn()
    onDeleteMock = vi.fn()
    onSelectMock = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders title and date', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onSelect={onSelectMock}
      />
    )

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText(/2026-03-01/i)).toBeInTheDocument()
  })

  it('calls onSelect when clicking the item container', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onSelect={onSelectMock}
      />
    )

    fireEvent.click(screen.getByText('Test Task'))

    expect(onSelectMock).toHaveBeenCalledTimes(1)
  })

  it('calls onEdit and does not trigger onSelect when edit button is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onSelect={onSelectMock}
      />
    )

    fireEvent.click(screen.getByTitle('Edit'))

    expect(onEditMock).toHaveBeenCalledWith(mockTodo)
    expect(onSelectMock).not.toHaveBeenCalled()
  })

  it('calls onDelete if user confirms deletion', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <TodoItem
        todo={mockTodo}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onSelect={onSelectMock}
      />
    )

    fireEvent.click(screen.getByTitle('Delete'))

    expect(window.confirm).toHaveBeenCalledWith('Delete "Test Task"?')
    expect(onDeleteMock).toHaveBeenCalledWith('abc123')
    expect(onSelectMock).not.toHaveBeenCalled()
  })

  it('does not call onDelete if user cancels confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(
      <TodoItem
        todo={mockTodo}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onSelect={onSelectMock}
      />
    )

    fireEvent.click(screen.getByTitle('Delete'))

    expect(onDeleteMock).not.toHaveBeenCalled()
  })
})

