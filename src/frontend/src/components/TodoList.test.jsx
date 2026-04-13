import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TodoList from './TodoList'

/*
  Mock TodoItem:
  - Renders a button
  - Calls onSelect when clicked
*/
vi.mock('./TodoItem', () => ({
  default: ({ todo, onSelect }) => (
    <button type="button" onClick={() => onSelect(todo, 'view')}>
      Select {todo.title}
    </button>
  )
}))

/*
  Mock TaskDetailModal:
  - Displays task title
  - Has close button
*/
vi.mock('./TaskDetailModal', () => ({
  default: ({ task, onClose }) => (
    <div>
      <span>Modal: {task.title}</span>
      <button onClick={onClose}>Close Modal</button>
    </div>
  )
}))

describe('TodoList', () => {
  const mockTodos = [
    { _id: 1, title: 'Task 1', date: '2026-04-01', status: 'todo' },
    { _id: 2, title: 'Task 2', date: '2026-04-02', status: 'todo' },
  ]

  const onEditMock = vi.fn()
  const onDeleteMock = vi.fn()
  const onAddMock = vi.fn()

  it('renders empty state when there are no todos', () => {
    render(
      <TodoList
        todos={[]}
        onAdd={onAddMock}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
      />
    )

    expect(
      screen.getByText(/no todos yet/i)
    ).toBeInTheDocument()
  })

  it('renders a TodoItem for each todo', () => {
    render(
      <TodoList
        todos={mockTodos}
        onAdd={onAddMock}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
      />
    )

    expect(screen.getByText(/select task 1/i)).toBeInTheDocument()
    expect(screen.getByText(/select task 2/i)).toBeInTheDocument()
  })

  it('opens modal when a todo is selected', () => {
    render(
      <TodoList
        todos={mockTodos}
        onAdd={onAddMock}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
      />
    )

    fireEvent.click(screen.getByText(/select task 1/i))

    expect(
      screen.getByText(/task 1/i)
    ).toBeInTheDocument()
  })

  it('closes modal when onClose is triggered', () => {
    render(
      <TodoList
        todos={mockTodos}
        onAdd={onAddMock}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
      />
    )

    fireEvent.click(screen.getByText(/select task 1/i))

    expect(screen.getByText(/task 1/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText(/close modal/i))

    expect(
      screen.queryByText(/modal: task 1/i)
    ).not.toBeInTheDocument()
  })
})

