import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CalendarView from './CalendarView'

/*
  Mock TaskDetailModal to avoid portal complexity.
*/
vi.mock('./TaskDetailModal', () => ({
  default: ({ task, onClose }) => (
    <div>
      <span>Modal: {task.title}</span>
      <button onClick={onClose}>Close Modal</button>
    </div>
  )
}))

describe('CalendarView', () => {
  const mockTodos = [
    { _id: '1', title: 'Meeting', date: '2026-03-15' },
    { _id: '2', title: 'Workout', date: '2026-03-15' },
    { _id: '3', title: 'Dentist', date: '2026-03-20' }
  ]

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-10'))
  })

  it('renders current month and year', () => {
    render(<CalendarView todos={[]} />)

    expect(screen.getByText(/march 2026/i)).toBeInTheDocument()
  })

  it('renders 42 day cells', () => {
    const { container } = render(<CalendarView todos={[]} />)

    const dayCells = container.querySelectorAll('.calendar-day-cell')
    expect(dayCells.length).toBe(42)
  })

  it('renders tasks on correct date', () => {
    render(<CalendarView todos={mockTodos} />)

    expect(screen.getByText('Meeting')).toBeInTheDocument()
    expect(screen.getByText('Workout')).toBeInTheDocument()
    expect(screen.getByText('Dentist')).toBeInTheDocument()
  })

  it('opens modal when task is clicked', () => {
    render(<CalendarView todos={mockTodos} />)

    fireEvent.click(screen.getByText('Meeting'))

    expect(screen.getByText(/modal: meeting/i)).toBeInTheDocument()
  })

  it('closes modal when onClose is triggered', () => {
    render(<CalendarView todos={mockTodos} />)

    fireEvent.click(screen.getByText('Meeting'))
    expect(screen.getByText(/modal: meeting/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText(/close modal/i))

    expect(
      screen.queryByText(/modal: meeting/i)
    ).not.toBeInTheDocument()
  })

  it('navigates to next month', () => {
    render(<CalendarView todos={[]} />)

    fireEvent.click(screen.getByText('→'))

    expect(screen.getByText(/april 2026/i)).toBeInTheDocument()
  })

  it('navigates to previous month', () => {
    render(<CalendarView todos={[]} />)

    fireEvent.click(screen.getByText('←'))

    expect(screen.getByText(/february 2026/i)).toBeInTheDocument()
  })

  it('resets to today when clicking Today button', () => {
    render(<CalendarView todos={[]} />)

    fireEvent.click(screen.getByText('→'))
    expect(screen.getByText(/april 2026/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText(/today/i))

    expect(screen.getByText(/march 2026/i)).toBeInTheDocument()
  })
})

